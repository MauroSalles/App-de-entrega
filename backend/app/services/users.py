from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User


def list_couriers(db: Session) -> list[User]:
    return db.scalars(select(User).where(User.role == UserRole.entregador).order_by(User.name.asc())).all()
