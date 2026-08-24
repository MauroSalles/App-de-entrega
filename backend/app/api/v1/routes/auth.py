from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserMe, UserRegister
from app.services.auth import authenticate_user, register_user

router = APIRouter()


@router.post("/register", response_model=UserMe)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    return authenticate_user(db, payload)


@router.get("/me", response_model=UserMe)
def me(user: User = Depends(get_current_user)):
    return user
