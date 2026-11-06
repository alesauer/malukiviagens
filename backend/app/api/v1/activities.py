from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, Activity, Trip
from app.schemas.schemas import (
    ActivityCreate,
    ActivityUpdate,
    ActivityOut,
    MessageResponse
)

router = APIRouter()

@router.get("/trip/{trip_id}", response_model=List[ActivityOut])
def list_trip_activities(
    trip_id: int,
    activity_date: Optional[date] = None,
    unscheduled_only: Optional[bool] = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista atividades do roteiro da viagem, com filtro por data ou catálogo sem data (RF09)"""
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    query = db.query(Activity).filter(Activity.trip_id == trip_id)

    if unscheduled_only:
        query = query.filter(Activity.date == None)
    elif activity_date:
        query = query.filter(Activity.date == activity_date)

    return query.order_by(Activity.date.asc(), Activity.order_index.asc(), Activity.time.asc()).all()

@router.post("/", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(
    act_in: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == act_in.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    activity = Activity(
        trip_id=act_in.trip_id,
        destination_id=act_in.destination_id,
        attraction_id=act_in.attraction_id,
        title=act_in.title,
        category=act_in.category,
        address=act_in.address,
        latitude=act_in.latitude,
        longitude=act_in.longitude,
        date=act_in.date,
        time=act_in.time,
        estimated_duration_minutes=act_in.estimated_duration_minutes,
        estimated_cost=act_in.estimated_cost,
        is_completed=act_in.is_completed,
        order_index=act_in.order_index,
        notes=act_in.notes,
        external_link=act_in.external_link
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="activity",
        entity_id=activity.id,
        description=f"Atividade '{activity.title}' incluída no roteiro da viagem '{trip.title}'."
    )

    return activity

@router.put("/{activity_id}", response_model=ActivityOut)
def update_activity(
    activity_id: int,
    act_in: ActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Atividade não encontrada.")

    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == activity.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    for field, value in act_in.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="update",
        entity_type="activity",
        entity_id=activity.id,
        description=f"Atividade '{activity.title}' atualizada."
    )

    return activity

@router.delete("/{activity_id}", response_model=MessageResponse)
def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Atividade não encontrada.")

    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == activity.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    title = activity.title
    db.delete(activity)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="delete",
        entity_type="activity",
        entity_id=activity_id,
        description=f"Atividade '{title}' removida do roteiro."
    )

    return MessageResponse(message=f"Atividade '{title}' excluída com sucesso.")
