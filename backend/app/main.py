from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .core.db import engine
from .models.base import Base
# Import all models so SQLAlchemy registers them before create_all
from .models.user import User, UserRole  # noqa: F401
from .models.interview import Interview, InterviewQuestion  # noqa: F401
from .models.query import Query  # noqa: F401
from .models.query_reply import QueryReply  # noqa: F401
from .models.release_note import ReleaseNoteFolder, ReleaseNoteDocument  # noqa: F401
from .models.article import Article  # noqa: F401

from .api.auth import router as auth_router
from .api.users import router as users_router
from .api.interviews import router as interviews_router
from .api.queries import router as queries_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Ensure new columns exist on queries table if database was already initialized
        await conn.execute(text("ALTER TABLE queries ADD COLUMN IF NOT EXISTS phone_number VARCHAR(255) NOT NULL DEFAULT '';"))
        await conn.execute(text("ALTER TABLE queries ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);"))
        await conn.execute(text("ALTER TABLE queries ADD COLUMN IF NOT EXISTS file_url VARCHAR(255);"))
    yield


app = FastAPI(
    title="Veeva Vault Hub API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://approval-hardwood-target.ngrok-free.dev/interviews",
        "https://veeva-valut-frontend.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles
from .api.release_notes import router as release_notes_router
from .api.articles import router as articles_router

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(users_router, prefix="/admin", tags=["Admin"])
app.include_router(interviews_router, prefix="/interviews", tags=["Interviews"])
app.include_router(queries_router, prefix="/interviews", tags=["Queries"])
app.include_router(release_notes_router, prefix="/release-notes", tags=["Release Notes"])
app.include_router(articles_router, prefix="/articles", tags=["Articles"])

# Ensure upload directory exists and mount static files
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/health")
def health_check():
    return {"status": "ok"}
