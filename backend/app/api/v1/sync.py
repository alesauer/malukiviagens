from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, Activity, Expense, ChecklistItem, LuggageItem, Trip
from app.schemas.schemas import SyncRequest, SyncResponse

router = APIRouter()

@router.post("/batch", response_model=SyncResponse)
def sync_batch_operations(
    sync_req: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Processamento em lote da fila de sincronização offline com detecção de conflitos (RF34)"""
    family_id = get_user_family_id(current_user, db)
    processed = 0
    conflicts: List[Dict[str, Any]] = []

    for op in sync_req.operations:
        try:
            if op.entity_type == "activity":
                if op.action == "create":
                    payload = op.payload
                    trip_id = payload.get("trip_id")
                    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
                    if trip:
                        act = Activity(
                            trip_id=trip_id,
                            title=payload.get("title", "Nova Atividade"),
                            category=payload.get("category", "passeio"),
                            address=payload.get("address"),
                            estimated_cost=payload.get("estimated_cost", 0.0),
                            is_completed=payload.get("is_completed", False),
                            notes=payload.get("notes")
                        )
                        db.add(act)
                        processed += 1
                elif op.action == "update":
                    act_id = op.payload.get("id")
                    act = db.query(Activity).filter(Activity.id == act_id).first()
                    if act:
                        if "is_completed" in op.payload:
                            act.is_completed = op.payload["is_completed"]
                        if "title" in op.payload:
                            act.title = op.payload["title"]
                        processed += 1
                    else:
                        conflicts.append({
                            "operation_id": op.operation_id,
                            "entity_type": op.entity_type,
                            "reason": "Registro não encontrado no servidor (possivelmente excluído por outro membro da família)"
                        })

            elif op.entity_type == "expense":
                if op.action == "create":
                    payload = op.payload
                    trip_id = payload.get("trip_id")
                    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
                    if trip:
                        exp = Expense(
                            trip_id=trip_id,
                            paid_by_id=current_user.id,
                            title=payload.get("title", "Despesa Offline"),
                            category=payload.get("category", "outras"),
                            amount=payload.get("amount", 0.0),
                            date=op.client_timestamp.date(),
                            payment_status=payload.get("payment_status", "pago"),
                            notes=payload.get("notes", "Registrado via modo offline")
                        )
                        db.add(exp)
                        processed += 1

            elif op.entity_type == "checklist_item":
                if op.action == "update":
                    item_id = op.payload.get("id")
                    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
                    if item:
                        if "is_completed" in op.payload:
                            item.is_completed = op.payload["is_completed"]
                        processed += 1

        except Exception as e:
            conflicts.append({
                "operation_id": op.operation_id,
                "entity_type": op.entity_type,
                "error": str(e)
            })

    db.commit()

    if processed > 0:
        log_audit(
            db=db,
            family_id=family_id or 1,
            user_id=current_user.id,
            action="sync",
            entity_type="offline_sync",
            entity_id=None,
            description=f"Sincronização offline concluída: {processed} operações processadas por {current_user.name}."
        )

    return SyncResponse(
        processed_count=processed,
        conflicts=conflicts,
        status="success" if not conflicts else "partial"
    )

