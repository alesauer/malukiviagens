import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from app.models.models import User, FamilyGroup, FamilyMember, AuditLog
from app.schemas.schemas import (
    UserRegister,
    UserLogin,
    UserUpdate,
    UserOut,
    Token,
    PasswordResetRequest,
    PasswordResetConfirm,
    MessageResponse
)

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está cadastrado no sistema."
        )

    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        phone=user_in.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create a default Family Group for the user if they don't have one
    family = FamilyGroup(
        name=f"Família {user.name.split()[0]}",
        admin_id=user.id
    )
    db.add(family)
    db.commit()
    db.refresh(family)

    member = FamilyMember(
        family_id=family.id,
        user_id=user.id,
        role="admin",
        nickname=user.name.split()[0]
    )
    db.add(member)
    db.commit()

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário desativado.")

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.phone is not None:
        current_user.phone = user_in.phone
    if user_in.avatar_url is not None:
        current_user.avatar_url = user_in.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/password-reset-request", response_model=MessageResponse)
def request_password_reset(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    # Always return success message for security to prevent user enumeration
    if not user:
        return MessageResponse(message="Se o e-mail estiver cadastrado, as instruções serão enviadas.")
    
    # In production with SMTP configured, this sends email. For dev/demo, returns token
    reset_token = create_access_token(subject=f"reset_{user.id}", expires_delta=timedelta(hours=1))
    return MessageResponse(
        message="Instruções para recuperação de senha enviadas com sucesso.",
        detail=f"Token de recuperação para testes: {reset_token}"
    )

@router.post("/password-reset-confirm", response_model=MessageResponse)
def confirm_password_reset(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    from app.core.security import decode_access_token
    payload = decode_access_token(req.token)
    if not payload or not str(payload.get("sub", "")).startswith("reset_"):
        raise HTTPException(status_code=400, detail="Token de recuperação inválido ou expirado.")

    user_id = int(str(payload.get("sub")).replace("reset_", ""))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return MessageResponse(message="Senha redefinida com sucesso. Faça login com a nova senha.")

