from pydantic import BaseModel


class RestaurantCreate(BaseModel):
    name: str
    description: str | None = None
    delivery_fee: float = 0
    avg_delivery_time_min: int = 40


class RestaurantOut(BaseModel):
    id: int
    name: str
    description: str | None
    delivery_fee: float
    avg_delivery_time_min: int

    class Config:
        from_attributes = True
