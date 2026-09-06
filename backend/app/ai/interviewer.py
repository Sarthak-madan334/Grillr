import os
from openai import OpenAI

from app.services.providers import AIInterviewer

SYSTEM_PROMPT = """You are an expert technical interviewer conducting a {interview_type} interview for a {job_role} position.
Your goal is to assess the candidate's skills, experience, and problem-solving abilities.
Keep your questions concise, professional, and targeted.
Do NOT output any conversational filler. Only output the question text.
"""

class LLMAIInterviewer(AIInterviewer):
    def __init__(self, api_key: str | None = None):
        self.client = OpenAI(api_key=api_key or os.environ.get("OPENAI_API_KEY"))
        self.model = "gpt-4o-mini"

    def first_question(self, job_role: str, interview_type: str) -> str:
        prompt = SYSTEM_PROMPT.format(job_role=job_role, interview_type=interview_type)
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": "Please generate the first question to start the interview. Make it a broad introductory question relevant to the role."}
        ]
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages, # type: ignore
                temperature=0.7,
                max_tokens=150,
                timeout=10.0
            )
            return response.choices[0].message.content.strip() # type: ignore
        except Exception as e:
            # Fallback
            import logging
            logging.error(f"LLM AIInterviewer failed on first_question: {e}")
            return f"Tell me about your background and experience relevant to {job_role}."

    def next_question(self, job_role: str, question_number: int, history: list[dict[str, str]]) -> str:
        # history contains {"role": "assistant"/"user", "content": "..."}
        # "assistant" -> interviewer's past questions
        # "user" -> candidate's past answers
        
        # We need to build the message array
        prompt = SYSTEM_PROMPT.format(job_role=job_role, interview_type="continuation")
        messages = [{"role": "system", "content": prompt}]
        
        # Add history
        for item in history:
            messages.append(item)
            
        messages.append({
            "role": "user", 
            "content": f"Based on my last answer, please generate question #{question_number}. Ask a follow-up if appropriate, or move to the next relevant topic for this role."
        })
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages, # type: ignore
                temperature=0.7,
                max_tokens=150,
                timeout=10.0
            )
            return response.choices[0].message.content.strip() # type: ignore
        except Exception as e:
            import logging
            logging.error(f"LLM AIInterviewer failed on next_question: {e}")
            return f"Thank you. Could you share another significant accomplishment as a {job_role}?"
