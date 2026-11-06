from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.models.models import User, Trip
from app.services.ai_service import AIService
from app.schemas.schemas import (
    AIChatRequest,
    AIChatResponse,
    AIDocumentParseResponse
)

router = APIRouter()

@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Conversa com assistente de inteligência artificial (RF26, RF38)"""
    context = ""
    if req.trip_id:
        family_id = get_user_family_id(current_user, db)
        trip = db.query(Trip).filter(Trip.id == req.trip_id, Trip.family_id == family_id).first()
        if trip:
            context = f"Viagem: {trip.title}, Destino: {trip.main_destination or 'A definir'}, Período: {trip.start_date} até {trip.end_date}."

    result = await AIService.chat(prompt=req.prompt, context=context)
    return AIChatResponse(
        reply=result["reply"],
        suggested_actions=result.get("suggested_actions"),
        sources=result.get("sources")
    )

@router.post("/parse-document", response_model=AIDocumentParseResponse)
async def parse_document_with_ai(
    file: UploadFile = File(...),
    doc_type: Optional[str] = Form("outros"),
    current_user: User = Depends(get_current_user)
):
    """Interpretação e extração inteligente de documentos por IA (RF23)"""
    file_bytes = await file.read()
    result = await AIService.parse_document(
        filename=file.filename or "documento.pdf",
        doc_type=doc_type or "outros",
        file_bytes=file_bytes
    )
    return AIDocumentParseResponse(
        document_type=result["document_type"],
        extracted_data=result["extracted_data"],
        confidence=result["confidence"],
        raw_summary=result["raw_summary"]
    )
