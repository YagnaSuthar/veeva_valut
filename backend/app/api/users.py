from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from uuid import UUID

from ..core.db import get_db
from ..core.security import hash_password
from ..core.deps import require_admin
from ..models.user import User
from ..schemas.user import UserCreate, UserOut, UserListResponse
from ..services.email import send_welcome_email, generate_temporary_password

router = APIRouter()


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Generate temporary password if not provided, or use provided password
    if user_data.password:
        temp_password = user_data.password
    else:
        temp_password = generate_temporary_password()
    
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(temp_password),
        role=user_data.role,
        created_by=current_admin.id
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Send welcome email with credentials in background
    background_tasks.add_task(
        send_welcome_email,
        recipient_email=new_user.email,
        recipient_name=new_user.name,
        temporary_password=temp_password,
        role=new_user.role.value
    )
    
    return new_user


@router.get("/users", response_model=UserListResponse)
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar()
    
    return UserListResponse(users=users, total=total)


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
    
    return None
