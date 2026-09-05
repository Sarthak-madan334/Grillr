from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class InterviewCreate(BaseModel):
    interview_type: str = Field(..., description="behavioral, technical, or hr")
    job_role: str = Field(..., min_length=2)
    experience_level: str = Field(default="mid")
    difficulty: str = Field(default="medium")
    personality: str = Field(default="professional")
    duration: int = Field(default=30, ge=15, le=60)
    resume_url: Optional[str] = None
    job_description: Optional[str] = None


class InterviewResponse(BaseModel):
    id: str
    status: str = "created"
    interview_type: str
    job_role: str
    created_at: datetime
