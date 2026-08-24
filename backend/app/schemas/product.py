from pydantic import BaseModel


class ProductCreate(BaseModel):
    restaurant_id: int
    category_id: int | None = None
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None
    is_available: bool = True


class ProductUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = None
    description: str | None = None
    price: float | None = None
    image_url: str | None = None
    is_available: bool | None = None


class ProductOut(BaseModel):
    id: int
    restaurant_id: int
    category_id: int | None
    name: str
    description: str | None
    price: float
    image_url: str | None
    is_available: bool

    class Config:
        from_attributes = True
