from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import Optional

from ..core.db import get_db
from ..core.deps import require_admin
from ..models.user import User
from ..models.interview import Interview, InterviewQuestion
from ..models.query import Query as DBQuery
from ..models.query_reply import QueryReply
from ..schemas.interview import (
    InterviewCreate, InterviewUpdate, InterviewOut, InterviewListResponse, QuestionIn
)

router = APIRouter()


@router.get("", response_model=InterviewListResponse)
async def list_interviews(
    topic: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Interview).options(
        selectinload(Interview.questions),
        selectinload(Interview.queries).selectinload(DBQuery.replies).selectinload(QueryReply.user)
    )
    
    if topic:
        query = query.where(Interview.topic == topic)
    
    query = query.order_by(Interview.created_at.desc())
    
    result = await db.execute(query)
    interviews = result.scalars().all()
    
    count_query = select(func.count()).select_from(Interview)
    if topic:
        count_query = count_query.where(Interview.topic == topic)
    
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    return InterviewListResponse(interviews=interviews, total=total)


@router.get("/{interview_id}", response_model=InterviewOut)
async def get_interview(
    interview_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Interview)
        .options(
            selectinload(Interview.questions),
            selectinload(Interview.queries).selectinload(DBQuery.replies).selectinload(QueryReply.user)
        )
        .where(Interview.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    
    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    return interview


@router.post("", response_model=InterviewOut, status_code=status.HTTP_201_CREATED)
async def create_interview(
    interview_data: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    interview = Interview(
        title=interview_data.title,
        topic=interview_data.topic,
        about=interview_data.about,
        created_by=current_admin.id
    )
    
    db.add(interview)
    await db.flush()
    
    for question_data in interview_data.questions:
        question = InterviewQuestion(
            interview_id=interview.id,
            question_text=question_data.question_text,
            order_index=question_data.order_index
        )
        db.add(question)
    
    await db.commit()
    await db.refresh(interview)
    
    result = await db.execute(
        select(Interview)
        .options(
            selectinload(Interview.questions),
            selectinload(Interview.queries).selectinload(DBQuery.replies).selectinload(QueryReply.user)
        )
        .where(Interview.id == interview.id)
    )
    interview = result.scalar_one()
    
    return interview


@router.put("/{interview_id}", response_model=InterviewOut)
async def update_interview(
    interview_id: UUID,
    interview_data: InterviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(Interview)
        .options(selectinload(Interview.questions))
        .where(Interview.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    
    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    if interview_data.title is not None:
        interview.title = interview_data.title
    if interview_data.topic is not None:
        interview.topic = interview_data.topic
    if interview_data.about is not None:
        interview.about = interview_data.about
    
    # If questions are provided, replace all existing questions
    if interview_data.questions is not None:
        # Delete old questions
        await db.execute(
            delete(InterviewQuestion).where(InterviewQuestion.interview_id == interview_id)
        )
        # Add new questions
        for question_data in interview_data.questions:
            question = InterviewQuestion(
                interview_id=interview_id,
                question_text=question_data.question_text,
                order_index=question_data.order_index
            )
            db.add(question)
    
    await db.commit()
    
    # Re-fetch with questions loaded
    result = await db.execute(
        select(Interview)
        .options(
            selectinload(Interview.questions),
            selectinload(Interview.queries).selectinload(DBQuery.replies).selectinload(QueryReply.user)
        )
        .where(Interview.id == interview_id)
    )
    interview = result.scalar_one()
    
    return interview


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    
    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    await db.execute(delete(Interview).where(Interview.id == interview_id))
    await db.commit()
    
    return None
