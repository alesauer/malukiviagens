import uuid
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, FamilyGroup, FamilyMember, FamilyInvite
from app.schemas.schemas import (
    FamilyGroupCreate,
    FamilyGroupOut,
    FamilyMemberOut,
    FamilyInviteCreate,
    FamilyInviteOut,
    MessageResponse
)

router = APIRouter()

@router.get("/current", response_model=FamilyGroupOut)
def get_current_family(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        raise HTTPException(status_code=404, detail="Você ainda não está associado a nenhum grupo familiar.")
    family = db.query(FamilyGroup).filter(FamilyGroup.id == family_id).first()
    return family

@router.post("/", response_model=FamilyGroupOut, status_code=status.HTTP_201_CREATED)
def create_family(
    fam_in: FamilyGroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family = FamilyGroup(
        name=fam_in.name,
        cover_image=fam_in.cover_image,
        admin_id=current_user.id
    )
    db.add(family)
    db.commit()
    db.refresh(family)

    member = FamilyMember(
        family_id=family.id,
        user_id=current_user.id,
        role="admin",
        nickname=current_user.name
    )
    db.add(member)
    db.commit()

    log_audit(
        db=db,
        family_id=family.id,
        user_id=current_user.id,
        action="create",
        entity_type="family_group",
        entity_id=family.id,
        description=f"Grupo familiar '{family.name}' criado."
    )

    db.refresh(family)
    return family

@router.post("/invites", response_model=FamilyInviteOut, status_code=status.HTTP_201_CREATED)
def create_invite(
    invite_in: FamilyInviteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        raise HTTPException(status_code=400, detail="Você precisa pertencer a um grupo familiar para convidar.")

    token = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(days=7)

    invite = FamilyInvite(
        family_id=family_id,
        email=invite_in.email,
        token=token,
        status="pending",
        expires_at=expires
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="family_invite",
        entity_id=invite.id,
        description=f"Convite enviado para {invite.email}."
    )

    return invite

@router.post("/invites/{token}/accept", response_model=MessageResponse)
def accept_invite(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invite = db.query(FamilyInvite).filter(FamilyInvite.token == token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Convite não encontrado.")
    if invite.status != "pending":
        raise HTTPException(status_code=400, detail="Este convite já foi utilizado ou cancelado.")

    exp = invite.expires_at
    now = datetime.now(timezone.utc) if exp.tzinfo is not None else datetime.now(timezone.utc).replace(tzinfo=None)
    if exp < now:
        invite.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Convite expirado.")

    # Add user to family
    existing = db.query(FamilyMember).filter(
        FamilyMember.family_id == invite.family_id,
        FamilyMember.user_id == current_user.id
    ).first()

    if not existing:
        member = FamilyMember(
            family_id=invite.family_id,
            user_id=current_user.id,
            role="member",
            nickname=current_user.name
        )
        db.add(member)

    invite.status = "accepted"
    db.commit()

    log_audit(
        db=db,
        family_id=invite.family_id,
        user_id=current_user.id,
        action="create",
        entity_type="family_member",
        entity_id=current_user.id,
        description=f"{current_user.name} ingressou no grupo familiar."
    )

    return MessageResponse(message="Convite aceito com sucesso! Agora você faz parte do grupo familiar.")

@router.delete("/members/{member_id}", response_model=MessageResponse)
def remove_family_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Integrante não encontrado.")

    family = db.query(FamilyGroup).filter(FamilyGroup.id == member.family_id).first()
    if not family or family.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas o administrador do grupo familiar pode remover membros.")

    if member.user_id == family.admin_id:
        raise HTTPException(status_code=400, detail="O administrador não pode ser removido do grupo familiar.")

    db.delete(member)
    db.commit()

    log_audit(
        db=db,
        family_id=family.id,
        user_id=current_user.id,
        action="delete",
        entity_type="family_member",
        entity_id=member_id,
        description=f"Integrante ID {member_id} removido da família."
    )

    return MessageResponse(message="Integrante removido da família com sucesso.")
