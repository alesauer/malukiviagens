import os
import uuid
import shutil
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, Document, FamilyGroup, Trip
from app.schemas.schemas import DocumentOut, MessageResponse

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
}

@router.get("/family/{family_id}", response_model=List[DocumentOut])
def list_family_documents(
    family_id: int,
    doc_type: Optional[str] = None,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_fam_id = get_user_family_id(current_user, db)
    if user_fam_id != family_id:
        raise HTTPException(status_code=403, detail="Acesso restrito ao grupo familiar.")

    query = db.query(Document).filter(Document.family_id == family_id)
    if doc_type:
        query = query.filter(Document.doc_type == doc_type)
    if user_id:
        query = query.filter(Document.user_id == user_id)

    return query.order_by(Document.created_at.desc()).all()

@router.get("/trip/{trip_id}", response_model=List[DocumentOut])
def list_trip_documents(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    return db.query(Document).filter(Document.trip_id == trip_id).order_by(Document.created_at.desc()).all()

@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    title: str = Form(...),
    doc_type: str = Form("outros"),
    trip_id: Optional[int] = Form(None),
    reservation_id: Optional[int] = Form(None),
    user_id: Optional[int] = Form(None),
    doc_number: Optional[str] = Form(None),
    issue_date: Optional[date] = Form(None),
    expiration_date: Optional[date] = Form(None),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        raise HTTPException(status_code=400, detail="Usuário sem grupo familiar ativo.")

    # Validate file type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de arquivo inválido ({file.content_type}). Permitidos: PDF, JPG, PNG."
        )

    # Read and check size
    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"O arquivo excede o limite máximo permitido de {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Save to disk
    family_folder = os.path.join(settings.UPLOAD_DIR, f"family_{family_id}")
    os.makedirs(family_folder, exist_ok=True)

    extension = os.path.splitext(file.filename)[1].lower() or ".bin"
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    full_path = os.path.join(family_folder, unique_filename)

    with open(full_path, "wb") as f:
        f.write(file_bytes)

    doc = Document(
        family_id=family_id,
        trip_id=trip_id,
        reservation_id=reservation_id,
        user_id=user_id or current_user.id,
        title=title,
        doc_type=doc_type,
        doc_number=doc_number,
        issue_date=issue_date,
        expiration_date=expiration_date,
        file_path=full_path,
        file_name=file.filename,
        file_size=len(file_bytes),
        file_type=file.content_type,
        notes=notes
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="document",
        entity_id=doc.id,
        description=f"Documento '{doc.title}' ({doc.doc_type}) anexado por {current_user.name}."
    )

    return doc

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")

    if doc.family_id != family_id:
        raise HTTPException(status_code=403, detail="Acesso restrito ao grupo familiar.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Arquivo físico não encontrado no servidor.")

    return FileResponse(
        path=doc.file_path,
        filename=doc.file_name,
        media_type=doc.file_type
    )

@router.delete("/{document_id}", response_model=MessageResponse)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")

    if doc.family_id != family_id:
        raise HTTPException(status_code=403, detail="Acesso restrito.")

    # Remove physical file if exists (avoiding orphaned files, RF42)
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    title = doc.title
    db.delete(doc)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="delete",
        entity_type="document",
        entity_id=document_id,
        description=f"Documento '{title}' excluído definitivamente."
    )

    return MessageResponse(message=f"Documento '{title}' excluído com sucesso.")

