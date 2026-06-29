from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.db import engine
from .models.base import Base
# Import all models so SQLAlchemy registers them before create_all
from .models.user import User, UserRole  # noqa: F401
from .models.interview import Interview, InterviewQuestion  # noqa: F401
from .models.query import Query  # noqa: F401

from .api.auth import router as auth_router
from .api.users import router as users_router
from .api.interviews import router as interviews_router
from .api.queries import router as queries_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Veeva Vault Hub API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://veeva-valut-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(users_router, prefix="/admin", tags=["Admin"])
app.include_router(interviews_router, prefix="/interviews", tags=["Interviews"])
app.include_router(queries_router, prefix="/interviews", tags=["Queries"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
