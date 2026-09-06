import pytest
from unittest.mock import MagicMock

from app.ai.interviewer import LLMAIInterviewer

def test_first_question(monkeypatch):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "What is your experience with React?"
    mock_client.chat.completions.create.return_value = mock_response

    monkeypatch.setattr("app.ai.interviewer.OpenAI", lambda api_key: mock_client)

    interviewer = LLMAIInterviewer(api_key="test")
    question = interviewer.first_question("Frontend Developer", "technical")
    
    assert question == "What is your experience with React?"
    mock_client.chat.completions.create.assert_called_once()
    args, kwargs = mock_client.chat.completions.create.call_args
    assert kwargs["model"] == "gpt-4o-mini"
    assert len(kwargs["messages"]) == 2

def test_next_question(monkeypatch):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Could you tell me more about how you optimized the performance?"
    mock_client.chat.completions.create.return_value = mock_response

    monkeypatch.setattr("app.ai.interviewer.OpenAI", lambda api_key: mock_client)

    interviewer = LLMAIInterviewer(api_key="test")
    
    history = [
        {"role": "assistant", "content": "What is your experience with React?"},
        {"role": "user", "content": "I have used it for 3 years."}
    ]
    
    question = interviewer.next_question("Frontend Developer", 2, history)
    
    assert question == "Could you tell me more about how you optimized the performance?"
    mock_client.chat.completions.create.assert_called_once()
    args, kwargs = mock_client.chat.completions.create.call_args
    assert len(kwargs["messages"]) == 4 # system + 2 history + new user prompt
