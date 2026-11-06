from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.models.models import User, AuditLog
from app.schemas.schemas import AuditLogOut

router = APIRouter()

@router.get("/logs", response_model=List[AuditLogOut])
def list_audit_logs(
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Consulta o histórico de auditoria do grupo familiar (RF41)"""
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        return []

    query = db.query(AuditLog).filter(AuditLog.family_id == family_id)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if action:
        query = query.filter(AuditLog.action == action)

    return query.order_by(AuditLog.timestamp.desc()).limit(100).all()
