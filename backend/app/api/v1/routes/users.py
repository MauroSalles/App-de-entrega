from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.auth import UserMe
from app.services.users import list_couriers

router = APIRouter()


@router.get("/couriers", response_model=list[UserMe])
def get_couriers(
    db: Session = Depends(get_db),
    _: None = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return list_couriers(db)
