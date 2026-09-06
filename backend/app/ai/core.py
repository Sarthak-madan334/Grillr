import json
import logging
import os
import time
from collections.abc import Iterator, Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any, Protocol, TypeVar

from openai import APIConnectionError, APITimeoutError, OpenAI, RateLimitError
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)
Message = dict[str, str]
ModelT = TypeVar("ModelT", bound=BaseModel)


class ChatProvider(Protocol):
    """Provider contract used by the orchestration layer."""

    def complete(self, *, model: str, messages: Sequence[Message], **kwargs: Any) -> Any: ...

    def stream(self, *, model: str, messages: Sequence[Message], **kwargs: Any) -> Iterator[Any]: ...

    def structured(self, *, model: str, messages: Sequence[Message], response_model: type[BaseModel], **kwargs: Any) -> Any: ...


class OpenAIChatProvider:
    def __init__(self, api_key: str | None = None):
        self.client = OpenAI(api_key=api_key)

    def complete(self, *, model: str, messages: Sequence[Message], **kwargs: Any) -> Any:
        return self.client.chat.completions.create(model=model, messages=list(messages), **kwargs)

    def stream(self, *, model: str, messages: Sequence[Message], **kwargs: Any) -> Iterator[Any]:
        return iter(self.client.chat.completions.create(model=model, messages=list(messages), stream=True, **kwargs))

    def structured(self, *, model: str, messages: Sequence[Message], response_model: type[BaseModel], **kwargs: Any) -> Any:
        return self.client.beta.chat.completions.parse(
            model=model, messages=list(messages), response_format=response_model, **kwargs
        )


@dataclass
class ConversationContext:
    """Bounded conversation memory that can be reused by any AI workflow."""

    messages: list[Message] = field(default_factory=list)
    max_messages: int = 20

    def add(self, role: str, content: str) -> None:
        if role not in {"system", "user", "assistant", "tool"}:
            raise ValueError(f"Unsupported message role: {role}")
        self.messages.append({"role": role, "content": content})
        self.messages[:] = self.messages[-self.max_messages :]

    def build(self, *, system: str | None = None, user: str | None = None) -> list[Message]:
        messages = list(self.messages)
        if system is not None:
            messages.insert(0, {"role": "system", "content": system})
        if user is not None:
            messages.append({"role": "user", "content": user})
        return messages


def build_prompt(template: str, values: Mapping[str, object]) -> str:
    """Render a prompt template with explicit dynamic context."""

    try:
        return template.format_map({key: str(value) for key, value in values.items()})
    except KeyError as exc:
        raise ValueError(f"Missing prompt value: {exc.args[0]}") from exc

class AICore:
    """
    Centralized AI Core service for handling LLM interactions securely and robustly.
    Handles API client initialization, automatic retries for transient errors, and
    both raw text and structured (JSON) completions.
    """
    
    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        provider: ChatProvider | None = None,
        max_attempts: int = 3,
        retry_delay: float = 0.5,
    ):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.provider = provider or OpenAIChatProvider(self.api_key)
        self.max_attempts = max(1, max_attempts)
        self.retry_delay = max(0.0, retry_delay)
        self.model = model or os.environ.get("AI_MODEL", "gpt-4o-mini")

    @staticmethod
    def _retryable(error: Exception) -> bool:
        return isinstance(error, (RateLimitError, APIConnectionError, APITimeoutError, TimeoutError))

    def _call(self, operation: Any) -> Any:
        for attempt in range(self.max_attempts):
            try:
                return operation()
            except Exception as error:
                if not self._retryable(error) or attempt == self.max_attempts - 1:
                    raise
                delay = self.retry_delay * (2**attempt)
                logger.warning("AI provider call failed; retrying in %.2fs", delay)
                if delay:
                    time.sleep(delay)

    def generate_text(
        self,
        messages: Sequence[Message],
        temperature: float = 0.7,
        max_tokens: int | None = 150,
        fallback: str | None = None,
    ) -> str:
        """
        Generate a standard text completion based on a list of messages.
        Retries automatically on timeouts, connection errors, or rate limits.
        """
        try:
            response = self._call(lambda: self.provider.complete(
                model=self.model, messages=messages, temperature=temperature, max_tokens=max_tokens, timeout=15.0
            ))
            content = response.choices[0].message.content
            if not content or not content.strip():
                raise ValueError("AI provider returned empty text")
            return content.strip()
        except Exception:
            logger.exception("Error generating text via AI Core")
            if fallback is not None:
                return fallback
            raise

    def stream_text(
        self,
        messages: Sequence[Message],
        temperature: float = 0.7,
        max_tokens: int | None = 150,
        fallback: str | None = None,
    ) -> Iterator[str]:
        """Yield text deltas; emit fallback only when opening the stream fails."""

        try:
            stream = self._call(lambda: self.provider.stream(
                model=self.model, messages=messages, temperature=temperature, max_tokens=max_tokens, timeout=15.0
            ))
            for chunk in stream:
                content = getattr(chunk.choices[0].delta, "content", None)
                if content:
                    yield content
        except Exception:
            logger.exception("Error streaming text via AI Core")
            if fallback is not None:
                yield fallback
            else:
                raise

    def generate_structured(
        self,
        messages: Sequence[Message],
        response_model: type[ModelT],
        temperature: float = 0.1,
        fallback: ModelT | None = None,
    ) -> ModelT:
        """
        Generate a structured JSON response mapped to a Pydantic model.
        Uses OpenAI's native response_format schema generation.
        """
        try:
            response = self._call(lambda: self.provider.structured(
                model=self.model, messages=messages, response_model=response_model,
                temperature=temperature, timeout=20.0
            ))
            parsed = response.choices[0].message.parsed
            if isinstance(parsed, response_model):
                return parsed
            content = response.choices[0].message.content
            if not content:
                raise ValueError("AI provider returned no structured content")
            return response_model.model_validate(json.loads(content))
        except (ValidationError, json.JSONDecodeError, TypeError, ValueError):
            logger.exception("Invalid structured response from AI Core")
            if fallback is not None:
                return fallback
            raise
        except Exception:
            logger.exception("Error generating structured data via AI Core")
            if fallback is not None:
                return fallback
            raise
