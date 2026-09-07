import pytest
from unittest.mock import MagicMock
from pydantic import BaseModel

from app.ai.core import AICore, ConversationContext, build_prompt

class MockResponse(BaseModel):
    score: int
    feedback: str

def test_generate_text(monkeypatch):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Text response"
    mock_client.chat.completions.create.return_value = mock_response

    monkeypatch.setattr("app.ai.core.OpenAI", lambda api_key: mock_client)

    core = AICore(api_key="test")
    res = core.generate_text([{"role": "user", "content": "hello"}])
    
    assert res == "Text response"
    mock_client.chat.completions.create.assert_called_once()

def test_generate_structured(monkeypatch):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.parsed = MockResponse(score=80, feedback="Good")
    mock_client.beta.chat.completions.parse.return_value = mock_response

    monkeypatch.setattr("app.ai.core.OpenAI", lambda api_key: mock_client)

    core = AICore(api_key="test")
    res = core.generate_structured([{"role": "user", "content": "eval"}], MockResponse)
    
    assert isinstance(res, MockResponse)
    assert res.score == 80
    assert res.feedback == "Good"
    mock_client.beta.chat.completions.parse.assert_called_once()


def test_prompt_and_context_helpers_bound_memory():
    context = ConversationContext(max_messages=2)
    context.add("user", "first")
    context.add("assistant", "second")
    context.add("user", "third")

    assert build_prompt("Role: {role}; history: {history}", {"role": "engineer", "history": "short"}) == "Role: engineer; history: short"
    assert context.build(system="Be concise", user="next") == [
        {"role": "system", "content": "Be concise"},
        {"role": "assistant", "content": "second"},
        {"role": "user", "content": "third"},
        {"role": "user", "content": "next"},
    ]


def test_generate_text_retries_transient_errors():
    provider = MagicMock()
    provider.complete.side_effect = [TimeoutError(), TimeoutError(), MagicMock(
        choices=[MagicMock(message=MagicMock(content=" recovered "))]
    )]

    core = AICore(provider=provider, max_attempts=3, retry_delay=0)

    assert core.generate_text([]) == "recovered"
    assert provider.complete.call_count == 3


def test_generate_text_returns_fallback_after_failure():
    provider = MagicMock()
    provider.complete.side_effect = RuntimeError("provider unavailable")

    core = AICore(provider=provider, max_attempts=1)

    assert core.generate_text([], fallback="Try again later") == "Try again later"


def test_generate_structured_validates_payload_and_uses_fallback():
    provider = MagicMock()
    provider.structured.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(parsed=None, content='{"score": "not a number"}'))]
    )
    fallback = MockResponse(score=0, feedback="Unavailable")

    result = AICore(provider=provider, max_attempts=1).generate_structured([], MockResponse, fallback=fallback)

    assert result == fallback


def test_stream_text_yields_deltas():
    provider = MagicMock()
    provider.stream.return_value = iter([
        MagicMock(choices=[MagicMock(delta=MagicMock(content="Hello"))]),
        MagicMock(choices=[MagicMock(delta=MagicMock(content=" world"))]),
    ])

    result = list(AICore(provider=provider, max_attempts=1).stream_text([]))

    assert result == ["Hello", " world"]
