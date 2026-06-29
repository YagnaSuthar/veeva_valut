import asyncio
from core.db import engine 
from models.base import Base

from models.user import User
from models.interview import Interview, InterviewQuestion
from models.query import Query

async def init_db():
    print(Base.metadata.tables.keys())
    print(len(Base.metadata.tables))

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())