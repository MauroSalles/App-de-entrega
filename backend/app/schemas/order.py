from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import OrderStatus


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class OrderItemInput(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)
    item_note: str | None = None


class OrderCreate(BaseModel):
    restaurant_id: int
    delivery_address_id: int
    notes: str | None = None
    items: list[OrderItemInput] = Field(default_factory=list)


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


class CartItemOut(BaseModel):
    id: int
    product_id: int
    restaurant_id: int
    product_name: str
    quantity: int
    unit_price: float
    line_total: float
