import uuid
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Article(Base, TimestampMixin):
    __tablename__ = "articles"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title       = Column(String(255), nullable=False)
    excerpt     = Column(Text, nullable=False)
    content     = Column(Text, nullable=False)
    topic       = Column(String(255), nullable=False)
    read_time   = Column(String(50), nullable=False, default="5 min read")
    created_by  = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # relationships
    creator     = relationship("User")
