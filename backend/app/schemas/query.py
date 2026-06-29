from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from uuid import UUID


class QueryCreate(BaseModel):
    sender_name: str
    sender_email: EmailStr
    message: str


class QueryOut(BaseModel):
    id: UUID
    interview_id: UUID
    sender_name: str
    sender_email: EmailStr
    message: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
