import logging
import json
from typing import Any

from app.services.providers import AIInterviewer, FollowUpDecision
from app.ai.core import AICore
from app.ai.prompts import (
    build_interviewer_system_message,
    build_conversation_history,
    build_first_question_prompt,
    build_follow_up_decision_prompt,
    build_next_question_prompt
)

logger = logging.getLogger(__name__)

class LLMAIInterviewer(AIInterviewer):
    def __init__(self, api_key: str | None = None):
        # Delegate client lifecycle to AI Core
        self.ai_core = AICore(api_key=api_key)

    def first_question(self, job_role: str, interview_type: str, *, personality: str = "professional", difficulty: str = "medium") -> str:
        messages = [
            build_interviewer_system_message(job_role, interview_type, personality, difficulty),
            build_first_question_prompt()
        ]
        
        try:
            return self.ai_core.generate_text(messages)
        except Exception as e:
            logger.error(f"LLM AIInterviewer failed on first_question: {e}")
            return f"Tell me about your background and experience relevant to {job_role}."

    def next_question(self, job_role: str, question_number: int, history: list[dict[str, str]], *, personality: str = "professional", difficulty: str = "medium") -> str:
        messages = [
            build_interviewer_system_message(job_role, "continuation", personality, difficulty)
        ]
        
        messages.extend(build_conversation_history(history))
        messages.append(build_next_question_prompt(question_number, difficulty))
        
        try:
            return self.ai_core.generate_text(messages)
        except Exception as e:
            logger.error(f"LLM AIInterviewer failed on next_question: {e}")
            return f"Thank you. Could you share another significant accomplishment as a {job_role}?"

    def decide_follow_up(
        self,
        *,
        job_role: str,
        interview_type: str,
        experience_level: str,
        difficulty: str,
        personality: str,
        question: str,
        answer: str,
        evaluation: dict[str, Any],
        history: list[dict[str, str]],
        follow_up_count: int,
    ) -> FollowUpDecision:
        messages = [build_interviewer_system_message(job_role, interview_type, personality, difficulty)]
        messages.extend(build_conversation_history(history))
        messages.append(build_follow_up_decision_prompt(question, answer, evaluation, follow_up_count, personality, difficulty))
        try:
            payload = json.loads(self.ai_core.generate_text(messages))
            return FollowUpDecision.from_payload(payload)
        except (Exception, ValueError) as exc:
            logger.warning("LLM follow-up decision failed; continuing to next question", extra={"error_type": type(exc).__name__})
            return FollowUpDecision(action="next_question", reason="Decision unavailable")
