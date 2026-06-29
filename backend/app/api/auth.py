from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..core.db import get_db
from ..core.security import verify_password, create_access_token, hash_password
from ..core.deps import get_current_user
from ..models.user import User, UserRole
from ..schemas.auth import LoginRequest, TokenResponse, UserMe
from ..schemas.user import UserCreate, UserOut

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if user is None or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserMe)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/setup-admin", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def setup_admin(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check if ANY admin exists
    result = await db.execute(select(func.count()).select_from(User).where(User.role == UserRole.admin))
    admin_count = result.scalar()
    
    if admin_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Initial admin setup already completed"
        )
        
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
        role=UserRole.admin
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

