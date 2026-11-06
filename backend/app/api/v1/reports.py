import io
import json
from datetime import date
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File
from sqlalchemy.orm import Session
import openpyxl
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.models.models import User, Trip, Destination, Activity, Reservation, Expense, ChecklistItem
from app.schemas.schemas import MessageResponse

router = APIRouter()

@router.get("/trip/{trip_id}/pdf")
def export_trip_pdf(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gera relatório completo da viagem em PDF (RF36, RF37)"""
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    destinations = db.query(Destination).filter(Destination.trip_id == trip_id).all()
    reservations = db.query(Reservation).filter(Reservation.trip_id == trip_id).all()
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()
    activities = db.query(Activity).filter(Activity.trip_id == trip_id).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#166534'),
        spaceAfter=10
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=12,
        spaceAfter=6
    )

    story = [
        Paragraph(f"Relatório da Viagem: {trip.title}", title_style),
        Paragraph(f"Período: {trip.start_date.strftime('%d/%m/%Y')} até {trip.end_date.strftime('%d/%m/%Y')} | Categoria: {trip.category.title()} | Status: {trip.status.title()}", subtitle_style),
        Spacer(1, 10),
        Paragraph("1. Destinos", h2_style)
    ]

    dest_data = [["Cidade", "País", "Chegada", "Partida"]]
    for d in destinations:
        dest_data.append([
            d.city,
            d.country,
            d.arrival_date.strftime('%d/%m/%Y') if d.arrival_date else '-',
            d.departure_date.strftime('%d/%m/%Y') if d.departure_date else '-'
        ])
    if len(dest_data) == 1:
        dest_data.append(["Nenhum destino específico cadastrado", "-", "-", "-"])

    t_dest = Table(dest_data, colWidths=[150, 120, 100, 100])
    t_dest.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1'))
    ]))
    story.append(t_dest)
    story.append(Spacer(1, 15))

    # Reservations
    story.append(Paragraph("2. Reservas", h2_style))
    res_data = [["Tipo", "Estabelecimento / Cia", "Localizador", "Valor (R$)"]]
    for r in reservations:
        res_data.append([
            r.type.title(),
            r.title,
            r.booking_code or '-',
            f"R$ {float(r.total_value):.2f}"
        ])
    if len(res_data) == 1:
        res_data.append(["Nenhuma reserva cadastrada", "-", "-", "-"])

    t_res = Table(res_data, colWidths=[100, 180, 100, 90])
    t_res.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1'))
    ]))
    story.append(t_res)
    story.append(Spacer(1, 15))

    # Financial Summary
    total_spent = sum(float(e.amount) for e in expenses)
    story.append(Paragraph("3. Resumo Financeiro", h2_style))
    story.append(Paragraph(f"Total Geral de Despesas Registradas: <b>R$ {total_spent:.2f}</b>", styles['Normal']))

    doc.build(story)
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=relatorio_viagem_{trip_id}.pdf"}
    )

@router.get("/trip/{trip_id}/excel")
def export_trip_excel(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exportação de dados da viagem para planilha Excel (.xlsx) (RF36, RF39)"""
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    wb = openpyxl.Workbook()

    # Sheet 1: Informações Gerais
    ws_info = wb.active
    ws_info.title = "Viagem"
    ws_info.append(["Propriedade", "Valor"])
    ws_info.append(["Título", trip.title])
    ws_info.append(["Categoria", trip.category])
    ws_info.append(["Status", trip.status])
    ws_info.append(["Data de Início", trip.start_date.strftime('%d/%m/%Y')])
    ws_info.append(["Data de Término", trip.end_date.strftime('%d/%m/%Y')])
    ws_info.append(["Destino Principal", trip.main_destination or ""])

    # Sheet 2: Despesas
    ws_exp = wb.create_sheet(title="Despesas")
    ws_exp.append(["ID", "Data", "Título", "Categoria", "Valor (R$)", "Situação", "Quem Pagou"])
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()
    for e in expenses:
        ws_exp.append([
            e.id,
            e.date.strftime('%d/%m/%Y'),
            e.title,
            e.category,
            float(e.amount),
            e.payment_status,
            e.paid_by.name if e.paid_by else ""
        ])

    # Sheet 3: Roteiro
    ws_act = wb.create_sheet(title="Roteiro")
    ws_act.append(["ID", "Data", "Horário", "Título", "Categoria", "Endereço", "Concluído"])
    activities = db.query(Activity).filter(Activity.trip_id == trip_id).all()
    for a in activities:
        ws_act.append([
            a.id,
            a.date.strftime('%d/%m/%Y') if a.date else "Sem data",
            a.time.strftime('%H:%M') if a.time else "",
            a.title,
            a.category,
            a.address or "",
            "Sim" if a.is_completed else "Não"
        ])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=viagem_{trip_id}.xlsx"}
    )

@router.get("/trip/{trip_id}/json")
def export_trip_json(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exportação integral dos dados da viagem em JSON (RF39)"""
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    data = {
        "title": trip.title,
        "category": trip.category,
        "status": trip.status,
        "start_date": str(trip.start_date),
        "end_date": str(trip.end_date),
        "main_destination": trip.main_destination,
        "description": trip.description,
        "notes": trip.notes,
        "destinations": [
            {"city": d.city, "country": d.country, "arrival_date": str(d.arrival_date), "departure_date": str(d.departure_date)}
            for d in trip.destinations
        ],
        "activities": [
            {"title": a.title, "category": a.category, "date": str(a.date) if a.date else None, "time": str(a.time) if a.time else None}
            for a in trip.activities
        ],
        "expenses": [
            {"title": e.title, "category": e.category, "amount": float(e.amount), "date": str(e.date), "payment_status": e.payment_status}
            for e in trip.expenses
        ]
    }

    return Response(
        content=json.dumps(data, indent=2, ensure_ascii=False),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=viagem_{trip_id}.json"}
    )

@router.post("/import-json", response_model=MessageResponse)
async def import_trip_json(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Importação de dados de viagem em JSON (RF39)"""
    family_id = get_user_family_id(current_user, db)
    if not family_id:
        raise HTTPException(status_code=400, detail="Usuário sem grupo familiar ativo.")

    contents = await file.read()
    try:
        data = json.loads(contents.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Arquivo JSON inválido.")

    trip = Trip(
        family_id=family_id,
        created_by_id=current_user.id,
        title=data.get("title", "Viagem Importada"),
        category=data.get("category", "ferias"),
        status=data.get("status", "planejamento"),
        start_date=date.fromisoformat(data["start_date"]),
        end_date=date.fromisoformat(data["end_date"]),
        main_destination=data.get("main_destination"),
        description=data.get("description"),
        notes=data.get("notes")
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    return MessageResponse(message=f"Viagem '{trip.title}' importada com sucesso com ID {trip.id}.")

