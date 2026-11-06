from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user, get_user_family_id
from app.core.audit import log_audit
from app.models.models import User, Expense, ExpenseSplit, BudgetCategory, Trip
from app.schemas.schemas import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseOut,
    BudgetCategoryCreate,
    BudgetCategoryOut,
    FinancialSummary,
    MessageResponse
)

router = APIRouter()

@router.get("/trip/{trip_id}/expenses", response_model=List[ExpenseOut])
def list_trip_expenses(
    trip_id: int,
    category: Optional[str] = None,
    payment_status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    query = db.query(Expense).filter(Expense.trip_id == trip_id)
    if category:
        query = query.filter(Expense.category == category)
    if payment_status:
        query = query.filter(Expense.payment_status == payment_status)

    return query.order_by(Expense.date.desc(), Expense.id.desc()).all()

@router.post("/expenses", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    exp_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == exp_in.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    expense = Expense(
        trip_id=exp_in.trip_id,
        reservation_id=exp_in.reservation_id,
        paid_by_id=exp_in.paid_by_id or current_user.id,
        title=exp_in.title,
        category=exp_in.category,
        amount=exp_in.amount,
        date=exp_in.date,
        payment_status=exp_in.payment_status,
        notes=exp_in.notes
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)

    # Process splits if provided
    if exp_in.splits:
        for s in exp_in.splits:
            split = ExpenseSplit(
                expense_id=expense.id,
                user_id=s.user_id,
                participant_name=s.participant_name,
                split_amount=s.split_amount,
                is_settled=s.is_settled
            )
            db.add(split)
        db.commit()
        db.refresh(expense)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="create",
        entity_type="expense",
        entity_id=expense.id,
        description=f"Despesa '{expense.title}' no valor de R$ {expense.amount:.2f} registrada por {current_user.name}."
    )

    return expense

@router.put("/expenses/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    exp_in: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada.")

    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == expense.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=403, detail="Acesso restrito.")

    for field, value in exp_in.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="update",
        entity_type="expense",
        entity_id=expense.id,
        description=f"Despesa '{expense.title}' atualizada."
    )

    return expense

@router.delete("/expenses/{expense_id}", response_model=MessageResponse)
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada.")

    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == expense.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=403, detail="Acesso restrito.")

    title = expense.title
    db.delete(expense)
    db.commit()

    log_audit(
        db=db,
        family_id=family_id,
        user_id=current_user.id,
        action="delete",
        entity_type="expense",
        entity_id=expense_id,
        description=f"Despesa '{title}' excluída definitivamente."
    )

    return MessageResponse(message=f"Despesa '{title}' excluída com sucesso.")

@router.get("/trip/{trip_id}/budgets", response_model=List[BudgetCategoryOut])
def get_trip_budgets(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    return db.query(BudgetCategory).filter(BudgetCategory.trip_id == trip_id).all()

@router.post("/budgets", response_model=BudgetCategoryOut)
def set_trip_budget(
    budget_in: BudgetCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == budget_in.trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    budget = db.query(BudgetCategory).filter(
        BudgetCategory.trip_id == budget_in.trip_id,
        BudgetCategory.category == budget_in.category
    ).first()

    if budget:
        budget.budgeted_amount = budget_in.budgeted_amount
    else:
        budget = BudgetCategory(
            trip_id=budget_in.trip_id,
            category=budget_in.category,
            budgeted_amount=budget_in.budgeted_amount
        )
        db.add(budget)

    db.commit()
    db.refresh(budget)
    return budget

@router.get("/trip/{trip_id}/summary", response_model=FinancialSummary)
def get_financial_summary(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resumo financeiro detalhado: orçado vs realizado, despesas por categoria e por pessoa (RF16)"""
    family_id = get_user_family_id(current_user, db)
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.family_id == family_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viagem não encontrada.")

    budgets = db.query(BudgetCategory).filter(BudgetCategory.trip_id == trip_id).all()
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()

    total_budget = sum(float(b.budgeted_amount) for b in budgets)
    total_spent = sum(float(e.amount) for e in expenses if e.payment_status == "pago")
    total_pending = sum(float(e.amount) for e in expenses if e.payment_status == "pendente")
    balance = total_budget - (total_spent + total_pending)

    by_category: Dict[str, Dict[str, float]] = {}
    for b in budgets:
        by_category[b.category] = {"budgeted": float(b.budgeted_amount), "spent": 0.0, "pending": 0.0}

    for e in expenses:
        if e.category not in by_category:
            by_category[e.category] = {"budgeted": 0.0, "spent": 0.0, "pending": 0.0}
        if e.payment_status == "pago":
            by_category[e.category]["spent"] += float(e.amount)
        else:
            by_category[e.category]["pending"] += float(e.amount)

    by_person: Dict[str, float] = {}
    for e in expenses:
        payer = e.paid_by.name if e.paid_by else "Não identificado"
        by_person[payer] = by_person.get(payer, 0.0) + float(e.amount)

    return FinancialSummary(
        total_budget=round(total_budget, 2),
        total_spent=round(total_spent, 2),
        total_pending=round(total_pending, 2),
        balance=round(balance, 2),
        by_category=by_category,
        by_person=by_person
    )

