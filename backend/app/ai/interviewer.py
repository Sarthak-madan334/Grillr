import logging
import os

from app.services.providers import AIInterviewer
from app.ai.core import AICore
from app.ai.prompts import (
    build_interviewer_system_message,
    build_conversation_history,
    build_first_question_prompt,
    build_next_question_prompt
)

logger = logging.getLogger(__name__)

class LLMAIInterviewer(AIInterviewer):
    def __init__(self, api_key: str | None = None):
        # Delegate client lifecycle to AI Core
        self.ai_core = AICore(api_key=api_key)

    def first_question(self, job_role: str, interview_type: str) -> str:
        messages = [
            build_interviewer_system_message(job_role, interview_type),
            build_first_question_prompt()
        ]
        
        try:
            return self.ai_core.generate_text(messages)
        except Exception as e:
            logger.error(f"LLM AIInterviewer failed on first_question: {e}")
            return f"Tell me about your background and experience relevant to {job_role}."

    def next_question(self, job_role: str, question_number: int, history: list[dict[str, str]]) -> str:
        messages = [
            build_interviewer_system_message(job_role, "continuation")
        ]
        
        messages.extend(build_conversation_history(history))
        messages.append(build_next_question_prompt(question_number))
        
        try:
            return self.ai_core.generate_text(messages)
        except Exception as e:
            logger.error(f"LLM AIInterviewer failed on next_question: {e}")
            return f"Thank you. Could you share another significant accomplishment as a {job_role}?"
