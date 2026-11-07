from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, Trip, TripParticipant, Destination, FamilyGroup
from app.schemas.schemas import (
    TripCreate,
    TripUpdate,
    TripOut,
    TripParticipantCreate,
    TripParticipantUpdate,
    TripParticipantOut,
    MessageResponse
)

router = APIRouter()

@router.get("/", response_model=List[TripOut])
def list_trips(
    category: Optional[str] = None,
    trip_status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        return []

    query = db.query(Trip).filter(Trip.family_id == family_id)
    if category:
        query = query.filter(Trip.category == category)
    if trip_status:
        query = query.filter(Trip.status == trip_status)

    trips = query.order_by(Trip.start_date.desc()).all()

    # Automatically suggest status adjustments based on date if in planning or confirmed (RF04)
    today = date.today()
    for trip in trips:
        if trip.status not in ["realizada", "cancelada"]:
            if trip.start_date <= today <= trip.end_date:
                trip.status = "em_andamento"
            elif trip.end_date < today and trip.status == "em_andamento":
                trip.status = "realizada"
    db.commit()

    return trips

@router.post("/", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        raise HTTPException(status_code=400, detail="Você deve pertencer a um grupo familiar para criar viagens.")

    trip = Trip(
        family_id=family_id,
        created_by_id=current_user.id,
        title=trip_in.title,
        category=trip_in.category,
        status=trip_in.status,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        main_destination=trip_in.main_destination,
        description=trip_in.description,
        notes=trip_in.notes,
        cover_image=trip_in.cover_image
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    # Add creator as participant
    creator_part = TripParticipant(
        trip_id=trip.id,
        user_id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        is_external=False
    )
    db.add(creator_part)

    # Add other participants if provided
    if trip_in.participants:
        for p in trip_in.participants:
            if p.user_id != current_user.id:
                part = TripParticipant(
                    trip_id=trip.id,
                    user_id=p.user_id,
                    name=p.name,
                    email=p.email,
                    is_external=p.is_external
                )
                db.add(part)

    # Also automatically create primary destination if main_destination specified
    if trip_in.main_destination:
        dest = Destination(
            family_id=family_id,
            trip_id=trip.id,
            city=trip_in.main_destination,
            country="Brasil",
            arrival_date=trip_in.start_date,
            departure_date=trip_in.end_date,
            is_catalog=False
        )
        db.add(dest)

    db.commit()
    db.refresh(trip)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="trip",
        entity_id=trip.id,
        description=f"Viagem '{trip.title}' criada por {current_user.name}."
    )

    return trip

@router.get("/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")
    return trip

@router.put("/{trip_id}", response_model=TripOut)
def update_trip(
    trip_id: int,
    trip_in: TripUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    for field, value in trip_in.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="update",
        entity_type="trip",
        entity_id=trip.id,
        description=f"Viagem '{trip.title}' atualizada por {current_user.name}."
    )

    return trip

@router.post("/{trip_id}/finish", response_model=TripOut)
def finish_trip(
    trip_id: int,
    general_rating: Optional[float] = None,
    review_comments: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Encerramento de viagem (RF37)"""
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    trip.status = "realizada"
    if general_rating is not None:
        trip.general_rating = general_rating
    if review_comments is not None:
        trip.review_comments = review_comments

    db.commit()
    db.refresh(trip)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="finish",
        entity_type="trip",
        entity_id=trip.id,
        description=f"Viagem '{trip.title}' finalizada com status 'realizada'."
    )

    return trip

@router.delete("/{trip_id}", response_model=MessageResponse)
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    trip_title = trip.title
    db.delete(trip)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="delete",
        entity_type="trip",
        entity_id=trip_id,
        description=f"Viagem '{trip_title}' excluída definitivamente (RF42)."
    )

    return MessageResponse(message=f"Viagem '{trip_title}' excluída com sucesso.")

@router.post("/{trip_id}/participants", response_model=TripParticipantOut, status_code=status.HTTP_201_CREATED)
def add_participant(
    trip_id: int,
    part_in: TripParticipantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    part = TripParticipant(
        trip_id=trip_id,
        user_id=part_in.user_id,
        name=part_in.name,
        email=part_in.email,
        is_external=part_in.is_external
    )
    db.add(part)
    db.commit()
    db.refresh(part)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="trip_participant",
        entity_id=part.id,
        description=f"Participante '{part.name}' adicionado à viagem '{trip.title}'."
    )

    return part

@router.put("/{trip_id}/participants/{participant_id}", response_model=TripParticipantOut)
def update_participant(
    trip_id: int,
    participant_id: int,
    part_in: TripParticipantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    part = db.query(TripParticipant).filter(
        TripParticipant.id == participant_id,
        TripParticipant.trip_id == trip_id
    ).first()
    if not part:
        raise HTTPException(status_code=404, detail="Participante não encontrado.")

    update_data = part_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(part, field, value)

    db.commit()
    db.refresh(part)
    return part

@router.delete("/{trip_id}/participants/{participant_id}", response_model=MessageResponse)
def remove_participant(
    trip_id: int,
    participant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    part = db.query(TripParticipant).filter(
        TripParticipant.id == participant_id,
        TripParticipant.trip_id == trip_id
    ).first()
    if not part:
        raise HTTPException(status_code=404, detail="Participante não encontrado.")

    part_name = part.name
    db.delete(part)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="delete",
        entity_type="trip_participant",
        entity_id=participant_id,
        description=f"Participante '{part_name}' removido da viagem '{trip.title}'."
    )

    return MessageResponse(message="Participante removido com sucesso.")

