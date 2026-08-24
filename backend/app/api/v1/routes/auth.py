from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserMe, UserRegister

router = APIRouter()


@router.post("/register", response_model=UserMe)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email ja cadastrado")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais invalidas")

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserMe)
def me(user: User = Depends(get_current_user)):
    return user


@router.get("/couriers", response_model=list[UserMe])
def list_couriers(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return db.scalars(select(User).where(User.role == UserRole.entregador, User.is_active.is_(True))).all()
