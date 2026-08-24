from datetime import datetime

from pydantic import BaseModel

from app.models.enums import OrderStatus


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class OrderItemInput(BaseModel):
    product_id: int
    quantity: int
    item_note: str | None = None


class OrderCreate(BaseModel):
    restaurant_id: int
    delivery_address_id: int
    notes: str | None = None
    items: list[OrderItemInput]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    id: int
    restaurant_id: int
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    total: float
    created_at: datetime

    class Config:
        from_attributes = True
