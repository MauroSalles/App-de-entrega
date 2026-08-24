from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import DeliveryStatus


class AssignCourierInput(BaseModel):
    courier_user_id: int


class DeliveryStatusUpdate(BaseModel):
    status: DeliveryStatus


class DeliveryLocationInput(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
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
