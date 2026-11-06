from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, Attraction, AttractionReview, Destination
from app.schemas.schemas import (
    AttractionCreate,
    AttractionUpdate,
    AttractionOut,
    AttractionReviewCreate,
    AttractionReviewOut,
    MessageResponse
)

router = APIRouter()

def build_attraction_out(attraction: Attraction) -> AttractionOut:
    avg_rating = None
    if attraction.reviews:
        ratings = [r.rating for r in attraction.reviews]
        avg_rating = round(sum(ratings) / len(ratings), 1)

    out = AttractionOut.model_validate(attraction)
    out.average_rating = avg_rating
    return out

@router.get("/", response_model=List[AttractionOut])
def list_attractions(
    destination_id: Optional[int] = None,
    category: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    query = db.query(Attraction)
    if family_id:
        query = query.filter((Attraction.family_id == family_id) | (Attraction.family_id == None))
    if destination_id is not None:
        query = query.filter(Attraction.destination_id == destination_id)
    if category:
        query = query.filter(Attraction.category == category)
    if is_favorite is not None:
        query = query.filter(Attraction.is_favorite == is_favorite)

    attractions = query.order_by(Attraction.name.asc()).all()
    return [build_attraction_out(a) for a in attractions]

@router.post("/", response_model=AttractionOut, status_code=status.HTTP_201_CREATED)
def create_attraction(
    attr_in: AttractionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)

    attraction = Attraction(
        family_id=family_id,
        destination_id=attr_in.destination_id,
        name=attr_in.name,
        category=attr_in.category,
        address=attr_in.address,
        latitude=attr_in.latitude,
        longitude=attr_in.longitude,
        phone=attr_in.phone,
        website=attr_in.website,
        opening_hours=attr_in.opening_hours,
        price_range=attr_in.price_range,
        booking_link=attr_in.booking_link,
        image_url=attr_in.image_url,
        description=attr_in.description,
        notes=attr_in.notes,
        is_favorite=attr_in.is_favorite
    )
    db.add(attraction)
    db.commit()
    db.refresh(attraction)

    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="create",
        entity_type="attraction",
        entity_id=attraction.id,
        description=f"Atração/Restaurante '{attraction.name}' cadastrado."
    )

    return build_attraction_out(attraction)

@router.get("/{attraction_id}", response_model=AttractionOut)
def get_attraction(
    attraction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
    if not attraction:
        raise HTTPException(status_code=404, detail="Atração não encontrada.")
    return build_attraction_out(attraction)

@router.put("/{attraction_id}", response_model=AttractionOut)
def update_attraction(
    attraction_id: int,
    attr_in: AttractionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
    if not attraction:
        raise HTTPException(status_code=404, detail="Atração não encontrada.")

    for field, value in attr_in.model_dump(exclude_unset=True).items():
        setattr(attraction, field, value)

    db.commit()
    db.refresh(attraction)

    family_id = get_user_family_id(current_user, db)
    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="update",
        entity_type="attraction",
        entity_id=attraction.id,
        description=f"Atração '{attraction.name}' atualizada."
    )

    return build_attraction_out(attraction)

@router.delete("/{attraction_id}", response_model=MessageResponse)
def delete_attraction(
    attraction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
    if not attraction:
        raise HTTPException(status_code=404, detail="Atração não encontrada.")

    name = attraction.name
    family_id = get_user_family_id(current_user, db)
    db.delete(attraction)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="delete",
        entity_type="attraction",
        entity_id=attraction_id,
        description=f"Atração '{name}' excluída com sucesso."
    )

    return MessageResponse(message=f"Atração '{name}' excluída com sucesso.")

@router.post("/{attraction_id}/reviews", response_model=AttractionReviewOut, status_code=status.HTTP_201_CREATED)
def add_review(
    attraction_id: int,
    review_in: AttractionReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registra uma avaliação individual de familiar (RF08)"""
    attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
    if not attraction:
        raise HTTPException(status_code=404, detail="Atração não encontrada.")

    # Check if user already reviewed this attraction
    existing = db.query(AttractionReview).filter(
        AttractionReview.attraction_id == attraction_id,
        AttractionReview.user_id == current_user.id
    ).first()

    if existing:
        existing.rating = review_in.rating
        existing.comment = review_in.comment
        existing.visit_date = review_in.visit_date
        db.commit()
        db.refresh(existing)
        return existing

    review = AttractionReview(
        attraction_id=attraction_id,
        user_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment,
        visit_date=review_in.visit_date
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    family_id = get_user_family_id(current_user, db)
    log_audit(
        db=db,
        family_id=family_id or 1,
        user_id=current_user.id,
        action="create",
        entity_type="attraction_review",
        entity_id=review.id,
        description=f"Avaliação ({review.rating} estrelas) registrada para '{attraction.name}' por {current_user.name}."
    )

    return review

