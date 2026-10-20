import logging
import json
from typing import Any

from app.services.providers import AIInterviewer, FollowUpDecision, MockAIInterviewer
from app.ai.core import AICore
from app.ai.prompts import (
    build_interviewer_system_message,
    build_conversation_history,
    build_first_question_prompt,
    build_follow_up_decision_prompt,
    build_next_question_prompt,
    build_coding_question_prompt,
)

logger = logging.getLogger(__name__)

class LLMAIInterviewer(AIInterviewer):
    def __init__(self, api_key: str | None = None, model: str | None = None, base_url: str | None = None):
        # Delegate client lifecycle to AI Core
        self.ai_core = AICore(api_key=api_key) if model is None and base_url is None else AICore(api_key=api_key, model=model, base_url=base_url)

    def first_question(self, job_role: str, interview_type: str, *, personality: str = "professional", difficulty: str = "medium") -> str:
        messages = [
            build_interviewer_system_message(job_role, interview_type, personality, difficulty),
            build_first_question_prompt(job_role, interview_type)
        ]
        
        try:
            return self.ai_core.generate_text(messages, temperature=0.3, max_tokens=180)
        except Exception as e:
            logger.error(f"LLM AIInterviewer failed on first_question: {e}")
            return MockAIInterviewer().first_question(job_role, interview_type, personality=personality, difficulty=difficulty)

    def next_question(self, job_role: str, question_number: int, history: list[dict[str, str]], *, personality: str = "professional", difficulty: str = "medium", interview_type: str = "behavioral") -> str:
        messages = [
            build_interviewer_system_message(job_role, interview_type, personality, difficulty)
        ]
        
        messages.extend(build_conversation_history(history))
        messages.append(build_next_question_prompt(question_number, difficulty, interview_type, job_role))
        
        try:
            return self.ai_core.generate_text(messages, temperature=0.4, max_tokens=180)
        except Exception as e:
            logger.error(f"LLM AIInterviewer failed on next_question: {e}")
            return MockAIInterviewer().next_question(job_role, question_number, history, personality=personality, difficulty=difficulty, interview_type=interview_type)

    def coding_question(self, job_role: str, question_number: int, *, difficulty: str = "medium") -> str:
        messages = [
            build_interviewer_system_message(job_role, "technical coding", difficulty=difficulty),
            build_coding_question_prompt(job_role, question_number, difficulty),
        ]
        try:
            return self.ai_core.generate_text(messages, temperature=0.3, max_tokens=240)
        except Exception as exc:
            logger.error("LLM coding question generation failed: %s", exc)
            return MockAIInterviewer().coding_question(job_role, question_number, difficulty=difficulty)

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
            payload = json.loads(self.ai_core.generate_text(messages, temperature=0.1, max_tokens=220))
            return FollowUpDecision.from_payload(payload)
        except (Exception, ValueError) as exc:
            logger.warning("LLM follow-up decision failed; continuing to next question", extra={"error_type": type(exc).__name__})
            return FollowUpDecision(action="next_question", reason="Decision unavailable")
