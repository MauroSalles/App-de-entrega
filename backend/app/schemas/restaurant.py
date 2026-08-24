from pydantic import BaseModel


class RestaurantOut(BaseModel):
    id: int
    name: str
    description: str | None
    delivery_fee: float
    avg_delivery_time_min: int

    class Config:
        from_attributes = True
