from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional


class QuestionIn(BaseModel):
    question_text: str
    order_index: int = 0


class InterviewCreate(BaseModel):
    title: str
    topic: str
    about: Optional[str] = None
    questions: list[QuestionIn] = []


class InterviewUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    about: Optional[str] = None
    questions: Optional[list[QuestionIn]] = None


class QuestionOut(BaseModel):
    id: UUID
    question_text: str
    order_index: int
    
    model_config = ConfigDict(from_attributes=True)


class InterviewOut(BaseModel):
    id: UUID
    title: str
    topic: str
    about: Optional[str]
    created_at: datetime
    questions: list[QuestionOut] = []
    
    model_config = ConfigDict(from_attributes=True)


class InterviewListResponse(BaseModel):
    interviews: list[InterviewOut]
    total: int
