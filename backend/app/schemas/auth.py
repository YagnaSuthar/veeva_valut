from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from uuid import UUID


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserMe(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
