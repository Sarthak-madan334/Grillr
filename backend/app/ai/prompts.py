"""
Centralized prompt templates and message builder utilities for the AI Core.
"""

import json


INTERVIEWER_SYSTEM_PROMPT = """You are an expert technical interviewer conducting a {interview_type} interview for a {job_role} position.
Your goal is to assess the candidate's skills, experience, and problem-solving abilities.
Keep your questions concise, professional, and targeted.
Do NOT output any conversational filler. Only output the question text.
"""

def build_interviewer_system_message(job_role: str, interview_type: str, personality: str = "professional", difficulty: str = "medium") -> dict[str, str]:
    """
    Build the system message for the AI Interviewer persona.
    """
    prompt = INTERVIEWER_SYSTEM_PROMPT.format(
        job_role=job_role, 
        interview_type=interview_type
    )
    return {"role": "system", "content": prompt + f"\nInterviewer personality: {personality}. Question difficulty: {difficulty}. Keep evaluation standards unchanged."}

def build_conversation_history(history: list[dict[str, str]]) -> list[dict[str, str]]:
    """
    Validate and format conversation history.
    """
    # Just passing through for now, but provides a central point for truncation or filtering in the future.
    return [msg for msg in history if "role" in msg and "content" in msg]

def build_next_question_prompt(question_number: int, difficulty: str = "medium") -> dict[str, str]:
    """
    Build the final user prompt requesting the next follow-up question.
    """
    return {
        "role": "user", 
        "content": f"Based on my last answer, generate question #{question_number} at {difficulty} difficulty. Keep the requested personality tone."
    }


def build_follow_up_decision_prompt(question: str, answer: str, evaluation: dict, follow_up_count: int, personality: str = "professional", difficulty: str = "medium") -> dict[str, str]:
    return {
        "role": "user",
        "content": (
            "Return only JSON with action, question, and reason. action must be exactly one of "
            "follow_up, clarification, next_question, complete. Use follow_up for missing evidence or reasoning, "
            "clarification for an incomplete answer, next_question when sufficient, and complete only when finished. "
            f"The current follow-up count is {follow_up_count}; use a {personality} tone and {difficulty} complexity. Do not alter evaluation standards.\n"
            f"Question: {question}\nAnswer: {answer}\nEvaluation: {json.dumps(evaluation, default=str)}"
        ),
    }

def build_first_question_prompt() -> dict[str, str]:
    """
    Build the final user prompt requesting the first question.
    """
    return {
        "role": "user", 
        "content": "Please generate the first question to start the interview. Make it a broad introductory question relevant to the role."
    }
