from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.address import Address
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.address import AddressCreate, AddressOut, AddressUpdate

router = APIRouter()


@router.get("/addresses", response_model=list[AddressOut])
def list_addresses(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    return db.scalars(select(Address).where(Address.user_id == user.id)).all()


@router.post("/addresses", response_model=AddressOut)
def create_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    address = Address(user_id=user.id, **payload.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/addresses/{address_id}", response_model=AddressOut)
def update_address(
    address_id: int,
    payload: AddressUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    address = db.scalar(select(Address).where(Address.id == address_id, Address.user_id == user.id))
    if not address:
        raise HTTPException(status_code=404, detail="Endereco nao encontrado")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address


@router.delete("/addresses/{address_id}")
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    address = db.scalar(select(Address).where(Address.id == address_id, Address.user_id == user.id))
    if not address:
        raise HTTPException(status_code=404, detail="Endereco nao encontrado")

    db.delete(address)
    db.commit()
    return {"message": "Endereco removido"}
