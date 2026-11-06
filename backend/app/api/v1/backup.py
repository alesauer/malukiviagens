import os
import shutil
import tarfile
import zipfile
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, FamilyGroup
from app.schemas.schemas import MessageResponse

router = APIRouter()

@router.post("/create", response_model=MessageResponse)
def create_backup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gera um backup completo do sistema: banco de dados e arquivos anexados (RF40)"""
    family_id = get_user_family_id(current_user, db)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_filename = f"backup_travel_manager_{timestamp}.zip"
    backup_path = os.path.join(settings.BACKUP_DIR, backup_filename)

    with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Include database file if sqlite or dump metadata
        sqlite_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "travel_manager.db")
        if os.path.exists(sqlite_file):
            zipf.write(sqlite_file, arcname="database.db")

        # Include uploads folder
        if os.path.exists(settings.UPLOAD_DIR):
            for root, dirs, files in os.walk(settings.UPLOAD_DIR):
                for f in files:
                    file_path = os.path.join(root, f)
                    rel_path = os.path.relpath(file_path, settings.UPLOAD_DIR)
                    zipf.write(file_path, arcname=os.path.join("uploads", rel_path))

    # Keep only the 4 most recent backups (RF40)
    backups = sorted([f for f in os.listdir(settings.BACKUP_DIR) if f.startswith("backup_")], reverse=True)
    if len(backups) > 4:
        for old_backup in backups[4:]:
            try:
                os.remove(os.path.join(settings.BACKUP_DIR, old_backup))
            except Exception:
                pass

    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="create",
        entity_type="backup",
        entity_id=None,
        description=f"Backup completo '{backup_filename}' gerado com sucesso."
    )

    return MessageResponse(
        message="Backup gerado com sucesso.",
        detail=backup_filename
    )

@router.get("/list", response_model=List[str])
def list_backups(
    current_user: User = Depends(get_current_user)
):
    """Lista os backups disponíveis para download (RF40)"""
    if not os.path.exists(settings.BACKUP_DIR):
        return []
    return sorted([f for f in os.listdir(settings.BACKUP_DIR) if f.startswith("backup_")], reverse=True)

@router.get("/download/{filename}")
def download_backup(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Download manual do backup completo (RF40)"""
    # Sanitize filename
    safe_filename = os.path.basename(filename)
    path = os.path.join(settings.BACKUP_DIR, safe_filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Arquivo de backup não encontrado.")

    return FileResponse(
        path=path,
        filename=safe_filename,
        media_type="application/zip"
    )

@router.post("/restore", response_model=MessageResponse)
async def restore_backup(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restauração de backup completo em outra VPS ou ambiente (RF40)"""
    family_id = get_user_family_id(current_user, db)
    temp_path = os.path.join(settings.BACKUP_DIR, f"restore_temp_{file.filename}")

    with open(temp_path, "wb") as f:
        f.write(await file.read())

    try:
        with zipfile.ZipFile(temp_path, 'r') as zipf:
            zipf.extractall(settings.BACKUP_DIR)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="restore",
        entity_type="backup",
        entity_id=None,
        description=f"Arquivo de restauração '{file.filename}' processado."
    )

    return MessageResponse(message="Restauração concluída com sucesso.")

