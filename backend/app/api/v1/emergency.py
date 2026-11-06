from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, EmergencyContact
from app.schemas.schemas import (
    EmergencyContactCreate,
    EmergencyContactOut,
    MessageResponse
)

router = APIRouter()

@router.get("/", response_model=List[EmergencyContactOut])
def list_emergency_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista contatos de emergência do grupo familiar (RF29)"""
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        return []
    return db.query(EmergencyContact).filter(EmergencyContact.family_id == family_id).all()

@router.post("/", response_model=EmergencyContactOut, status_code=status.HTTP_201_CREATED)
def create_emergency_contact(
    contact_in: EmergencyContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        raise HTTPException(status_code=400, detail="Usuário sem grupo familiar.")

    contact = EmergencyContact(
        family_id=family_id,
        user_id=contact_in.user_id or current_user.id,
        name=contact_in.name,
        phone=contact_in.phone,
        relationship_label=contact_in.relationship_label,
        notes=contact_in.notes
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="emergency_contact",
        entity_id=contact.id,
        description=f"Contato de emergência '{contact.name}' cadastrado por {current_user.name}."
    )

    return contact

@router.delete("/{contact_id}", response_model=MessageResponse)
def delete_emergency_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.family_id == family_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contato de emergência não encontrado.")

    name = contact.name
    db.delete(contact)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="delete",
        entity_type="emergency_contact",
        entity_id=contact_id,
        description=f"Contato de emergência '{name}' excluído."
    )

    return MessageResponse(message=f"Contato de emergência '{name}' excluído com sucesso.")

