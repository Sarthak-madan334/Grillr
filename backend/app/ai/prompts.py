"""
Centralized prompt templates and message builder utilities for the AI Core.
"""

INTERVIEWER_SYSTEM_PROMPT = """You are an expert technical interviewer conducting a {interview_type} interview for a {job_role} position.
Your goal is to assess the candidate's skills, experience, and problem-solving abilities.
Keep your questions concise, professional, and targeted.
Do NOT output any conversational filler. Only output the question text.
"""

def build_interviewer_system_message(job_role: str, interview_type: str) -> dict[str, str]:
    """
    Build the system message for the AI Interviewer persona.
    """
    prompt = INTERVIEWER_SYSTEM_PROMPT.format(
        job_role=job_role, 
        interview_type=interview_type
    )
    return {"role": "system", "content": prompt}

def build_conversation_history(history: list[dict[str, str]]) -> list[dict[str, str]]:
    """
    Validate and format conversation history.
    """
    # Just passing through for now, but provides a central point for truncation or filtering in the future.
    return [msg for msg in history if "role" in msg and "content" in msg]

def build_next_question_prompt(question_number: int) -> dict[str, str]:
    """
    Build the final user prompt requesting the next follow-up question.
    """
    return {
        "role": "user", 
        "content": f"Based on my last answer, please generate question #{question_number}. Ask a follow-up if appropriate, or move to the next relevant topic for this role."
    }

def build_first_question_prompt() -> dict[str, str]:
    """
    Build the final user prompt requesting the first question.
    """
    return {
        "role": "user", 
        "content": "Please generate the first question to start the interview. Make it a broad introductory question relevant to the role."
    }
