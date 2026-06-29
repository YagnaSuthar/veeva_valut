from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from ..core.db import get_db
from ..core.deps import require_admin
from ..models.user import User, UserRole
from ..models.interview import Interview
from ..models.query import Query
from ..schemas.query import QueryCreate, QueryOut
from ..services.email import send_query_notification

router = APIRouter()


@router.post("/{interview_id}/queries", response_model=QueryOut, status_code=status.HTTP_201_CREATED)
async def create_query(
    interview_id: UUID,
    query_data: QueryCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Submit a query on an interview. Sends email notifications to all registered users."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    
    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    new_query = Query(
        interview_id=interview_id,
        sender_name=query_data.sender_name,
        sender_email=query_data.sender_email,
        message=query_data.message
    )
    
    db.add(new_query)
    await db.commit()
    await db.refresh(new_query)
    
    # Get all registered users' emails for notifications
    result = await db.execute(select(User.email).where(User.email.isnot(None)))
    recipient_emails = [row[0] for row in result.fetchall()]
    
    # Send notifications in background so API responds quickly
    background_tasks.add_task(
        send_query_notification,
        interview_title=interview.title,
        sender_name=query_data.sender_name,
        sender_email=query_data.sender_email,
        message=query_data.message,
        recipient_emails=recipient_emails
    )
    
    return new_query


@router.get("/{interview_id}/queries", response_model=list[QueryOut])
async def list_queries(
    interview_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get all queries for an interview (admin only)."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    
    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    result = await db.execute(
        select(Query)
        .where(Query.interview_id == interview_id)
        .order_by(Query.created_at.desc())
    )
    queries = result.scalars().all()
    
    return queries
