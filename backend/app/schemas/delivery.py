from datetime import datetime

from pydantic import BaseModel

from app.models.enums import DeliveryStatus


class AssignCourierInput(BaseModel):
    courier_user_id: int


class DeliveryStatusUpdate(BaseModel):
    status: DeliveryStatus


class DeliveryLocationInput(BaseModel):
    latitude: float
    longitude: float
    status: str | None = None


class DeliveryOut(BaseModel):
    id: int
    order_id: int
    courier_user_id: int | None
    status: DeliveryStatus
    started_at: datetime | None
    delivered_at: datetime | None

    class Config:
        from_attributes = True
