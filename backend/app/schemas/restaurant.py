from pydantic import BaseModel


class RestaurantCreate(BaseModel):
    name: str
    description: str | None = None
    delivery_fee: float = 0
    avg_delivery_time_min: int = 40
    is_active: bool = True
    owner_user_id: int | None = None


class RestaurantUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    delivery_fee: float | None = None
    avg_delivery_time_min: int | None = None
    is_active: bool | None = None


class RestaurantOut(BaseModel):
    id: int
    owner_user_id: int
    name: str
    description: str | None
    delivery_fee: float
    avg_delivery_time_min: int
    is_active: bool

    class Config:
        from_attributes = True
