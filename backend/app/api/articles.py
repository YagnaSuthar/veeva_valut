from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from ..core.db import get_db
from ..core.deps import require_admin
from ..models.user import User
from ..models.article import Article
from ..schemas.article import ArticleCreate, ArticleOut

router = APIRouter()

@router.post("", response_model=ArticleOut, status_code=status.HTTP_201_CREATED)
async def create_article(
    article_data: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    article = Article(
        title=article_data.title,
        excerpt=article_data.excerpt,
        content=article_data.content,
        topic=article_data.topic,
        read_time=article_data.read_time,
        created_by=current_admin.id
    )
    db.add(article)
    await db.commit()
    await db.refresh(article)
    
    # attach creator name manually for schema
    out = ArticleOut.model_validate(article)
    out.creator_name = current_admin.name
    return out

@router.get("", response_model=list[ArticleOut])
async def list_articles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article, User.name.label("creator_name"))
        .join(User, Article.created_by == User.id)
        .order_by(Article.created_at.desc())
    )
    rows = result.all()
    articles_out = []
    for row in rows:
        article, creator_name = row
        out = ArticleOut.model_validate(article)
        out.creator_name = creator_name
        articles_out.append(out)
    return articles_out

@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article, User.name.label("creator_name"))
        .join(User, Article.created_by == User.id)
        .where(Article.id == article_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    article, creator_name = row
    out = ArticleOut.model_validate(article)
    out.creator_name = creator_name
    return out

@router.put("/{article_id}", response_model=ArticleOut)
async def update_article(
    article_id: UUID,
    article_data: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(Article)
        .where(Article.id == article_id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
        
    article.title = article_data.title
    article.excerpt = article_data.excerpt
    article.content = article_data.content
    article.topic = article_data.topic
    article.read_time = article_data.read_time
    
    await db.commit()
    await db.refresh(article)
    
    out = ArticleOut.model_validate(article)
    out.creator_name = current_admin.name
    return out

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(Article)
        .where(Article.id == article_id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    await db.delete(article)
    await db.commit()
    return None
