import uuid
import enum
from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class UserRole(str, enum.Enum):
    admin = "admin"
    user  = "user"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email          = Column(String(255), unique=True, nullable=False, index=True)
    name           = Column(String(255), nullable=False)
    hashed_password = Column(String, nullable=False)
    role           = Column(Enum(UserRole), nullable=False, default=UserRole.user)
    created_by     = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # relationships
    interviews      = relationship("Interview", back_populates="creator", foreign_keys="Interview.created_by")
    created_users   = relationship("User", backref="creator", remote_side=[id], foreign_keys=[created_by])