import uuid
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Query(Base, TimestampMixin):
    __tablename__ = "queries"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    sender_name  = Column(String(255), nullable=False)
    sender_email = Column(String(255), nullable=False)
    message      = Column(Text, nullable=False)

    # relationship
    interview = relationship("Interview", back_populates="queries")