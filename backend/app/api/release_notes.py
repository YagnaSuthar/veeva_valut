from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from ..core.db import get_db
from ..core.deps import require_admin
from ..models.user import User
from ..models.release_note import ReleaseNoteFolder, ReleaseNoteDocument
from ..schemas.release_note import (
    ReleaseNoteFolderCreate,
    ReleaseNoteFolderOut,
    ReleaseNoteDocumentCreate,
    ReleaseNoteDocumentOut
)

router = APIRouter()

# Folder Endpoints
@router.post("/folders", response_model=ReleaseNoteFolderOut, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_data: ReleaseNoteFolderCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    folder = ReleaseNoteFolder(name=folder_data.name, description=folder_data.description)
    db.add(folder)
    await db.commit()
    
    result = await db.execute(
        select(ReleaseNoteFolder)
        .options(selectinload(ReleaseNoteFolder.documents))
        .where(ReleaseNoteFolder.id == folder.id)
    )
    folder = result.scalar_one()
    return folder

@router.get("/folders", response_model=list[ReleaseNoteFolderOut])
async def list_folders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ReleaseNoteFolder)
        .options(selectinload(ReleaseNoteFolder.documents))
        .order_by(ReleaseNoteFolder.created_at.desc())
    )
    folders = result.scalars().all()
    return folders

@router.get("/folders/{folder_id}", response_model=ReleaseNoteFolderOut)
async def get_folder(folder_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ReleaseNoteFolder)
        .options(selectinload(ReleaseNoteFolder.documents))
        .where(ReleaseNoteFolder.id == folder_id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    return folder

@router.put("/folders/{folder_id}", response_model=ReleaseNoteFolderOut)
async def update_folder(
    folder_id: UUID,
    folder_data: ReleaseNoteFolderCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(ReleaseNoteFolder)
        .where(ReleaseNoteFolder.id == folder_id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    folder.name = folder_data.name
    folder.description = folder_data.description
    await db.commit()
    
    result = await db.execute(
        select(ReleaseNoteFolder)
        .options(selectinload(ReleaseNoteFolder.documents))
        .where(ReleaseNoteFolder.id == folder_id)
    )
    folder = result.scalar_one()
    return folder

@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(ReleaseNoteFolder)
        .where(ReleaseNoteFolder.id == folder_id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    await db.delete(folder)
    await db.commit()
    return None

# Document Endpoints
@router.post("/folders/{folder_id}/documents", response_model=ReleaseNoteDocumentOut, status_code=status.HTTP_201_CREATED)
async def create_document(
    folder_id: UUID,
    doc_data: ReleaseNoteDocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(ReleaseNoteFolder)
        .where(ReleaseNoteFolder.id == folder_id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    
    doc = ReleaseNoteDocument(
        folder_id=folder_id,
        title=doc_data.title,
        content=doc_data.content,
        file_url=doc_data.file_url
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc

@router.put("/documents/{document_id}", response_model=ReleaseNoteDocumentOut)
async def update_document(
    document_id: UUID,
    doc_data: ReleaseNoteDocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(ReleaseNoteDocument)
        .where(ReleaseNoteDocument.id == document_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    doc.title = doc_data.title
    doc.content = doc_data.content
    doc.file_url = doc_data.file_url
    await db.commit()
    await db.refresh(doc)
    return doc

@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(ReleaseNoteDocument)
        .where(ReleaseNoteDocument.id == document_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    await db.delete(doc)
    await db.commit()
    return None
