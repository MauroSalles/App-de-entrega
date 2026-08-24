from pydantic import BaseModel


class AddressBase(BaseModel):
    street: str
    number: str
    district: str
    city: str
    state: str
    zip_code: str
    complement: str | None = None
    reference: str | None = None


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    street: str | None = None
    number: str | None = None
    district: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    complement: str | None = None
    reference: str | None = None


class AddressOut(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
