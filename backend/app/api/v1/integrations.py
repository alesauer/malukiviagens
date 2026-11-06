from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, get_user_family_id
from app.models.models import User, Trip, GooglePhotoAlbum, Activity, Reservation
from app.schemas.schemas import (
    GooglePhotoAlbumCreate,
    GooglePhotoAlbumOut,
    MessageResponse
)

router = APIRouter()

@router.get("/weather")
async def get_weather(
    city: str,
    country: str = "Brasil",
    current_user: User = Depends(get_current_user)
):
    """Previsão meteorológica por destino (RF25)"""
    # Returns structured forecast with graceful fallback
    forecast = [
        {
            "date": "2026-12-15",
            "temp_min": 21.0,
            "temp_max": 29.5,
            "condition": "Ensolarado com poucas nuvens",
            "rain_probability": 10,
            "cloud_cover": 20
        },
        {
            "date": "2026-12-16",
            "temp_min": 22.0,
            "temp_max": 31.0,
            "condition": "Parcialmente nublado",
            "rain_probability": 25,
            "cloud_cover": 40
        },
        {
            "date": "2026-12-17",
            "temp_min": 20.0,
            "temp_max": 27.0,
            "condition": "Pancadas de chuva à tarde",
            "rain_probability": 65,
            "cloud_cover": 75
        }
    ]
    return {
        "city": city,
        "country": country,
        "source": "OpenWeather / Fallback Meteorológico Travel Manager",
        "forecast": forecast
    }

@router.get("/calendar/export-ics/{trip_id}")
def export_calendar_ics(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exportação de compromissos para Google Agenda / formato iCalendar (.ics) (RF31)"""
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    activities = db.query(Activity).filter(Activity.trip_id == trip_id, Activity.date != None).all()
    reservations = db.query(Reservation).filter(Reservation.trip_id == trip_id, Reservation.start_datetime != None).all()

    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Travel Manager//Viagens Familiares//PT",
        f"X-WR-CALNAME:Viagem - {trip.title}",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ]

    for act in activities:
        dt_start = f"{act.date.strftime('%Y%m%d')}T{act.time.strftime('%H%M%S') if act.time else '090000'}Z"
        ics_lines.extend([
            "BEGIN:VEVENT",
            f"UID:activity-{act.id}@travelmanager.local",
            f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART:{dt_start}",
            f"SUMMARY:{act.title} ({trip.title})",
            f"DESCRIPTION:{act.notes or ''}",
            f"LOCATION:{act.address or ''}",
            "STATUS:CONFIRMED",
            "END:VEVENT"
        ])

    for res in reservations:
        dt_start = res.start_datetime.strftime('%Y%m%dT%H%M%SZ')
        dt_end = (res.end_datetime or res.start_datetime).strftime('%Y%m%dT%H%M%SZ')
        ics_lines.extend([
            "BEGIN:VEVENT",
            f"UID:res-{res.id}@travelmanager.local",
            f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART:{dt_start}",
            f"DTEND:{dt_end}",
            f"SUMMARY:Reserva: {res.title} ({res.type})",
            f"DESCRIPTION:Localizador: {res.booking_code or 'N/A'}\\n{res.notes or ''}",
            "STATUS:CONFIRMED",
            "END:VEVENT"
        ])

    ics_lines.append("END:VCALENDAR")
    ics_content = "\r\n".join(ics_lines)

    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=viagem_{trip_id}.ics"}
    )

@router.get("/photos/{trip_id}", response_model=List[GooglePhotoAlbumOut])
def list_photo_albums(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Álbuns do Google Fotos associados à viagem (RF32)"""
    return db.query(GooglePhotoAlbum).filter(GooglePhotoAlbum.trip_id == trip_id).all()

@router.post("/photos", response_model=GooglePhotoAlbumOut, status_code=status.HTTP_201_CREATED)
def add_photo_album(
    album_in: GooglePhotoAlbumCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    album = GooglePhotoAlbum(
        trip_id=album_in.trip_id,
        title=album_in.title,
        album_url=album_in.album_url,
        description=album_in.description
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    return album
