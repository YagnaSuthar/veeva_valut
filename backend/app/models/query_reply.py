import uuid
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class QueryReply(Base, TimestampMixin):
    __tablename__ = "query_replies"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id   = Column(UUID(as_uuid=True), ForeignKey("queries.id", ondelete="CASCADE"), nullable=False)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message    = Column(Text, nullable=False)

    # relationships
    user       = relationship("User")
    query      = relationship("Query", back_populates="replies")

    @property
    def user_name(self) -> str:
        return self.user.name if self.user else ""
