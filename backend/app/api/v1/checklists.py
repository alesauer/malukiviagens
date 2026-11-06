from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, ChecklistItem, LuggageItem, Trip
from app.schemas.schemas import (
    ChecklistItemCreate,
    ChecklistItemUpdate,
    ChecklistItemOut,
    LuggageItemCreate,
    LuggageItemUpdate,
    LuggageItemOut,
    MessageResponse
)

router = APIRouter()

# -------------------------------------------------------------
# Checklists (RF27)
# -------------------------------------------------------------
@router.get("/trip/{trip_id}", response_model=List[ChecklistItemOut])
def list_checklist_items(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    return db.query(ChecklistItem).filter(ChecklistItem.trip_id == trip_id).order_by(ChecklistItem.due_date.asc(), ChecklistItem.id.asc()).all()

@router.post("/", response_model=ChecklistItemOut, status_code=status.HTTP_201_CREATED)
def create_checklist_item(
    item_in: ChecklistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == item_in.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    item = ChecklistItem(
        trip_id=item_in.trip_id,
        assigned_to_id=item_in.assigned_to_id,
        title=item_in.title,
        category=item_in.category,
        priority=item_in.priority,
        due_date=item_in.due_date,
        is_completed=item_in.is_completed,
        notes=item_in.notes
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="checklist_item",
        entity_id=item.id,
        description=f"Tarefa '{item.title}' criada no checklist da viagem '{trip.title}'."
    )

    return item

@router.put("/{item_id}", response_model=ChecklistItemOut)
def update_checklist_item(
    item_id: int,
    item_in: ChecklistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item de checklist não encontrado.")

    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == item.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=403, detail="Acesso restrito.")

    for field, value in item_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", response_model=MessageResponse)
def delete_checklist_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item de checklist não encontrado.")

    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == item.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=403, detail="Acesso restrito.")

    title = item.title
    db.delete(item)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="delete",
        entity_type="checklist_item",
        entity_id=item_id,
        description=f"Item de checklist '{title}' excluído."
    )

    return MessageResponse(message=f"Item '{title}' excluído com sucesso.")

# -------------------------------------------------------------
# Luggage (RF28)
# -------------------------------------------------------------
@router.get("/luggage/{trip_id}", response_model=List[LuggageItemOut])
def list_luggage_items(
    trip_id: int,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    query = db.query(LuggageItem).filter(LuggageItem.trip_id == trip_id)
    if user_id:
        query = query.filter(LuggageItem.user_id == user_id)

    return query.order_by(LuggageItem.category.asc(), LuggageItem.description.asc()).all()

@router.post("/luggage", response_model=LuggageItemOut, status_code=status.HTTP_201_CREATED)
def create_luggage_item(
    lug_in: LuggageItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == lug_in.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    item = LuggageItem(
        trip_id=lug_in.trip_id,
        user_id=lug_in.user_id or current_user.id,
        description=lug_in.description,
        category=lug_in.category,
        quantity=lug_in.quantity,
        is_packed=lug_in.is_packed,
        notes=lug_in.notes
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/luggage/{item_id}", response_model=LuggageItemOut)
def update_luggage_item(
    item_id: int,
    lug_in: LuggageItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(LuggageItem).filter(LuggageItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item de bagagem não encontrado.")

    for field, value in lug_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/luggage/{item_id}", response_model=MessageResponse)
def delete_luggage_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(LuggageItem).filter(LuggageItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item de bagagem não encontrado.")

    desc = item.description
    db.delete(item)
    db.commit()
    return MessageResponse(message=f"Item de bagagem '{desc}' excluído com sucesso.")

