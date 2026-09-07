import pytest
from unittest.mock import MagicMock

from app.ai.interviewer import LLMAIInterviewer

def test_first_question(monkeypatch):
    mock_ai_core = MagicMock()
    mock_ai_core.generate_text.return_value = "What is your experience with React?"

    monkeypatch.setattr("app.ai.interviewer.AICore", lambda api_key: mock_ai_core)

    interviewer = LLMAIInterviewer(api_key="test")
    question = interviewer.first_question("Frontend Developer", "technical")
    
    assert question == "What is your experience with React?"
    mock_ai_core.generate_text.assert_called_once()
    messages = mock_ai_core.generate_text.call_args[0][0]
    assert len(messages) == 2

def test_next_question(monkeypatch):
    mock_ai_core = MagicMock()
    mock_ai_core.generate_text.return_value = "Could you tell me more about how you optimized the performance?"

    monkeypatch.setattr("app.ai.interviewer.AICore", lambda api_key: mock_ai_core)

    interviewer = LLMAIInterviewer(api_key="test")
    
    history = [
        {"role": "assistant", "content": "What is your experience with React?"},
        {"role": "user", "content": "I have used it for 3 years."}
    ]
    
    question = interviewer.next_question("Frontend Developer", 2, history)
    
    assert question == "Could you tell me more about how you optimized the performance?"
    mock_ai_core.generate_text.assert_called_once()
    messages = mock_ai_core.generate_text.call_args[0][0]
    assert len(messages) == 4 # system + 2 history + new user prompt
