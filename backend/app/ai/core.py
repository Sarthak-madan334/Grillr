import logging
import os
from typing import Any

from openai import OpenAI, RateLimitError, APIConnectionError, APITimeoutError
from pydantic import BaseModel
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class AICore:
    """
    Centralized AI Core service for handling LLM interactions securely and robustly.
    Handles API client initialization, automatic retries for transient errors, and
    both raw text and structured (JSON) completions.
    """
    
    def __init__(self, api_key: str | None = None, model: str = "gpt-4o-mini"):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.model = model
        self.client = OpenAI(api_key=self.api_key)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((RateLimitError, APIConnectionError, APITimeoutError)),
        reraise=True
    )
    def generate_text(self, messages: list[dict[str, str]], temperature: float = 0.7, max_tokens: int | None = 150) -> str:
        """
        Generate a standard text completion based on a list of messages.
        Retries automatically on timeouts, connection errors, or rate limits.
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages, # type: ignore
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=15.0
            )
            return response.choices[0].message.content.strip() # type: ignore
        except Exception as e:
            logger.error(f"Error generating text via AI Core: {e}")
            raise e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((RateLimitError, APIConnectionError, APITimeoutError)),
        reraise=True
    )
    def generate_structured(self, messages: list[dict[str, str]], response_model: type[BaseModel], temperature: float = 0.1) -> BaseModel:
        """
        Generate a structured JSON response mapped to a Pydantic model.
        Uses OpenAI's native response_format schema generation.
        """
        try:
            response = self.client.beta.chat.completions.parse(
                model=self.model,
                messages=messages, # type: ignore
                response_format=response_model,
                temperature=temperature,
                timeout=20.0
            )
            return response.choices[0].message.parsed # type: ignore
        except Exception as e:
            logger.error(f"Error generating structured data via AI Core: {e}")
            raise e
