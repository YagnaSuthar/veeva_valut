import uuid
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class ReleaseNoteFolder(Base, TimestampMixin):
    __tablename__ = "release_note_folders"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # relationships
    documents   = relationship("ReleaseNoteDocument", back_populates="folder", cascade="all, delete-orphan")


class ReleaseNoteDocument(Base, TimestampMixin):
    __tablename__ = "release_note_documents"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    folder_id   = Column(UUID(as_uuid=True), ForeignKey("release_note_folders.id", ondelete="CASCADE"), nullable=False)
    title       = Column(String(255), nullable=False)
    content     = Column(Text, nullable=False)
    file_url    = Column(String(255), nullable=True)

    # relationships
    folder      = relationship("ReleaseNoteFolder", back_populates="documents")
