from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional

class ArticleBase(BaseModel):
    title: str
    excerpt: str
    content: str
    topic: str
    read_time: str = "5 min read"

class ArticleCreate(ArticleBase):
    pass

class ArticleOut(ArticleBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    creator_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
