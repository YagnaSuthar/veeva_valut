from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional

class ReleaseNoteDocumentBase(BaseModel):
    title: str
    content: str
    file_url: Optional[str] = None

class ReleaseNoteDocumentCreate(ReleaseNoteDocumentBase):
    pass

class ReleaseNoteDocumentOut(ReleaseNoteDocumentBase):
    id: UUID
    folder_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ReleaseNoteFolderBase(BaseModel):
    name: str
    description: Optional[str] = None

class ReleaseNoteFolderCreate(ReleaseNoteFolderBase):
    pass

class ReleaseNoteFolderOut(ReleaseNoteFolderBase):
    id: UUID
    created_at: datetime
    documents: list[ReleaseNoteDocumentOut] = []

    model_config = ConfigDict(from_attributes=True)
