import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Interview(Base, TimestampMixin):
    __tablename__ = "interviews"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title      = Column(String(255), nullable=False)
    topic      = Column(String(255), nullable=False)
    about      = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # relationships
    creator    = relationship("User", back_populates="interviews", foreign_keys=[created_by])
    questions  = relationship("InterviewQuestion", back_populates="interview",
                              order_by="InterviewQuestion.order_index", cascade="all, delete-orphan")
    queries    = relationship("Query", back_populates="interview", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    order_index  = Column(Integer, nullable=False, default=0)

    # relationship
    interview = relationship("Interview", back_populates="questions")