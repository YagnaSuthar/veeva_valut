from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from uuid import UUID
from ..models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str | None = None
    role: UserRole = UserRole.user


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    users: list[UserOut]
    total: int
