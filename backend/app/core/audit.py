from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import AuditLog

def log_audit(
    db: Session,
    family_id: int,
    user_id: Optional[int],
    action: str,
    entity_type: str,
    entity_id: Optional[int],
    description: str
) -> AuditLog:
    """Registra uma operação de auditoria no sistema (RF41)"""
    entry = AuditLog(
        family_id=family_id,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
