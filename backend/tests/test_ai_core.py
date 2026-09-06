import pytest
from unittest.mock import MagicMock
from pydantic import BaseModel

from app.ai.core import AICore

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
