from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, Destination, Trip
from app.schemas.schemas import (
    DestinationCreate,
    DestinationUpdate,
    DestinationOut,
    MessageResponse
)

router = APIRouter()

@router.get("/", response_model=List[DestinationOut])
def list_destinations(
    trip_id: Optional[int] = None,
    is_catalog: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    query = db.query(Destination)
    if family_id:
        query = query.filter((Destination.family_id == family_id) | (Destination.is_catalog == True))
    if trip_id is not None:
        query = query.filter(Destination.trip_id == trip_id)
    if is_catalog is not None:
        query = query.filter(Destination.is_catalog == is_catalog)

    return query.order_by(Destination.city.asc()).all()

@router.get("/catalog", response_model=List[DestinationOut])
def get_catalog_destinations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Catálogo permanente de destinos reutilizáveis (RF06)"""
    family_id = get_user_family_id(current_user, db)
    query = db.query(Destination).filter(
        Destination.is_catalog == True,
        (Destination.family_id == family_id) | (Destination.family_id == None)
    )
    return query.order_by(Destination.city.asc()).all()

@router.post("/", response_model=DestinationOut, status_code=status.HTTP_201_CREATED)
def create_destination(
    dest_in: DestinationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)

    if dest_in.trip_id:
        trip = db.query(Trip).filter(Trip.id == dest_in.trip_id, Trip.family_id == family_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Viagem associada não encontrada.")

    dest = Destination(
        family_id=family_id,
        trip_id=dest_in.trip_id,
        city=dest_in.city,
        state_region=dest_in.state_region,
        country=dest_in.country,
        latitude=dest_in.latitude,
        longitude=dest_in.longitude,
        arrival_date=dest_in.arrival_date,
        departure_date=dest_in.departure_date,
        description=dest_in.description,
        notes=dest_in.notes,
        cover_image=dest_in.cover_image,
        is_catalog=dest_in.is_catalog
    )
    db.add(dest)
    db.commit()
    db.refresh(dest)

    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="create",
        entity_type="destination",
        entity_id=dest.id,
        description=f"Destino '{dest.city}, {dest.country}' cadastrado."
    )

    return dest

@router.get("/{dest_id}", response_model=DestinationOut)
def get_destination(
    dest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destino não encontrado.")
    return dest

@router.put("/{dest_id}", response_model=DestinationOut)
def update_destination(
    dest_id: int,
    dest_in: DestinationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destino não encontrado.")

    for field, value in dest_in.model_dump(exclude_unset=True).items():
        setattr(dest, field, value)

    db.commit()
    db.refresh(dest)

    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="update",
        entity_type="destination",
        entity_id=dest.id,
        description=f"Destino '{dest.city}' atualizado."
    )

    return dest

@router.delete("/{dest_id}", response_model=MessageResponse)
def delete_destination(
    dest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destino não encontrado.")

    city_name = dest.city
    db.delete(dest)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="delete",
        entity_type="destination",
        entity_id=dest_id,
        description=f"Destino '{city_name}' excluído."
    )

    return MessageResponse(message=f"Destino '{city_name}' excluído com sucesso.")

