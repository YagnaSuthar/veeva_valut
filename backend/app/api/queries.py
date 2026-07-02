import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from ..core.db import get_db
from ..core.deps import require_admin, get_current_user
from ..models.user import User, UserRole
from ..models.interview import Interview
from ..models.query import Query
from ..models.query_reply import QueryReply
from ..schemas.query import QueryCreate, QueryOut, QueryReplyCreate, QueryReplyOut
from ..services.email import send_query_notification, send_reply_notification

router = APIRouter()


@router.post("/{interview_id}/queries", response_model=QueryOut, status_code=status.HTTP_201_CREATED)
async def create_query(
    interview_id: UUID,
    background_tasks: BackgroundTasks,
    sender_name: str = Form(...),
    sender_email: str = Form(...),
    phone_number: str = Form(...),
    message: str = Form(...),
    image: UploadFile = File(None),
    file: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    """Submit a query on an interview. Sends email notifications with attachments to all registered users."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    
    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    image_url = None
    image_path = None
    if image and image.filename:
        os.makedirs("static/uploads", exist_ok=True)
        img_id = uuid.uuid4()
        ext = os.path.splitext(image.filename)[1]
        filename = f"{img_id}{ext}"
        image_path = os.path.join("static/uploads", filename)
        with open(image_path, "wb") as f:
            f.write(await image.read())
        image_url = f"/static/uploads/{filename}"
        
    file_url = None
    file_path = None
    if file and file.filename:
        os.makedirs("static/uploads", exist_ok=True)
        file_id = uuid.uuid4()
        ext = os.path.splitext(file.filename)[1]
        filename = f"{file_id}{ext}"
        file_path = os.path.join("static/uploads", filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        file_url = f"/static/uploads/{filename}"
        
    new_query = Query(
        interview_id=interview_id,
        sender_name=sender_name,
        sender_email=sender_email,
        phone_number=phone_number,
        message=message,
        image_url=image_url,
        file_url=file_url
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
        sender_name=sender_name,
        sender_email=sender_email,
        phone_number=phone_number,
        message=message,
        recipient_emails=recipient_emails,
        image_path=image_path,
        file_path=file_path
    )
    # Re-fetch query with eager loaded replies and users
    result = await db.execute(
        select(Query)
        .options(selectinload(Query.replies).selectinload(QueryReply.user))
        .where(Query.id == new_query.id)
    )
    new_query = result.scalar_one()
    
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
        .options(selectinload(Query.replies).selectinload(QueryReply.user))
        .where(Query.interview_id == interview_id)
        .order_by(Query.created_at.desc())
    )
    queries = result.scalars().all()
    
    return queries


@router.post("/queries/{query_id}/replies", response_model=QueryReplyOut, status_code=status.HTTP_201_CREATED)
async def create_query_reply(
    query_id: UUID,
    reply_data: QueryReplyCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a reply to a query (any registered user)."""
    result = await db.execute(select(Query).where(Query.id == query_id))
    query = result.scalar_one_or_none()
    if query is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )
    
    new_reply = QueryReply(
        query_id=query_id,
        user_id=current_user.id,
        message=reply_data.message
    )
    
    db.add(new_reply)
    await db.commit()
    await db.refresh(new_reply)
    
    # Get interview title for email notification
    result_int = await db.execute(select(Interview).where(Interview.id == query.interview_id))
    interview = result_int.scalar_one_or_none()
    interview_title = interview.title if interview else "Interview Details"
    
    # Send email notification to the query creator
    background_tasks.add_task(
        send_reply_notification,
        recipient_email=query.sender_email,
        recipient_name=query.sender_name,
        message=reply_data.message,
        reply_author_name=current_user.name,
        interview_title=interview_title
    )
    
    new_reply.user = current_user
    return new_reply
