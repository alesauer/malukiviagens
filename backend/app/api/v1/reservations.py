from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, Reservation, Trip, Expense
from app.schemas.schemas import (
    ReservationCreate,
    ReservationUpdate,
    ReservationOut,
    MessageResponse
)

router = APIRouter()

@router.get("/trip/{trip_id}", response_model=List[ReservationOut])
def list_trip_reservations(
    trip_id: int,
    res_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    query = db.query(Reservation).filter(Reservation.trip_id == trip_id)
    if res_type:
        query = query.filter(Reservation.type == res_type)

    return query.order_by(Reservation.start_datetime.asc()).all()

@router.post("/", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
def create_reservation(
    res_in: ReservationCreate,
    auto_create_expense: bool = False, # RF17
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == res_in.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    res = Reservation(
        trip_id=res_in.trip_id,
        destination_id=res_in.destination_id,
        type=res_in.type,
        title=res_in.title,
        provider=res_in.provider,
        start_datetime=res_in.start_datetime,
        end_datetime=res_in.end_datetime,
        booking_code=res_in.booking_code,
        contact_phone=res_in.contact_phone,
        contact_email=res_in.contact_email,
        total_value=res_in.total_value,
        currency=res_in.currency,
        payment_status=res_in.payment_status,
        details_json=res_in.details_json or "{}",
        notes=res_in.notes
    )
    db.add(res)
    db.commit()
    db.refresh(res)

    # Optional auto-expense creation (RF17)
    if auto_create_expense and res_in.total_value > 0:
        category_map = {
            "hospedagem": "hospedagem",
            "voo": "passagens",
            "transporte": "transporte",
            "restaurante": "alimentacao",
            "ingresso": "passeios",
            "seguro": "seguro_viagem"
        }
        exp = Expense(
            trip_id=trip.id,
            reservation_id=res.id,
            paid_by_id=current_user.id,
            title=f"Reserva: {res.title}",
            category=category_map.get(res.type, "outras"),
            amount=res.total_value,
            date=res.start_datetime.date() if res.start_datetime else date.today(),
            payment_status=res.payment_status,
            notes=f"Lançamento automático da reserva cód. {res.booking_code or res.id}"
        )
        db.add(exp)
        db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="reservation",
        entity_id=res.id,
        description=f"Reserva de {res.type} '{res.title}' criada na viagem '{trip.title}'."
    )

    return res

@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")
    return res

@router.put("/{reservation_id}", response_model=ReservationOut)
def update_reservation(
    reservation_id: int,
    res_in: ReservationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == res.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    for field, value in res_in.model_dump(exclude_unset=True).items():
        setattr(res, field, value)

    db.commit()
    db.refresh(res)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="update",
        entity_type="reservation",
        entity_id=res.id,
        description=f"Reserva '{res.title}' atualizada."
    )

    return res

@router.delete("/{reservation_id}", response_model=MessageResponse)
def delete_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == res.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    title = res.title
    db.delete(res)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="delete",
        entity_type="reservation",
        entity_id=reservation_id,
        description=f"Reserva '{title}' excluída definitivamente."
    )

    return MessageResponse(message=f"Reserva '{title}' excluída com sucesso.")
