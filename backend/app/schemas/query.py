from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional

# QueryReply schemas
class QueryReplyCreate(BaseModel):
    message: str

class QueryReplyOut(BaseModel):
    id: UUID
    query_id: UUID
    user_id: UUID
    user_name: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QueryCreate(BaseModel):
    sender_name: str
    sender_email: EmailStr
    phone_number: str
    message: str
    image_url: Optional[str] = None
    file_url: Optional[str] = None


class QueryOut(BaseModel):
    id: UUID
    interview_id: UUID
    sender_name: str
    sender_email: EmailStr
    phone_number: str
    message: str
    image_url: Optional[str] = None
    file_url: Optional[str] = None
    created_at: datetime
    replies: list[QueryReplyOut] = []
    
    model_config = ConfigDict(from_attributes=True)
