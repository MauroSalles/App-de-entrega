from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(140), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    delivery_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    avg_delivery_time_min: Mapped[int] = mapped_column(Integer, default=40)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
