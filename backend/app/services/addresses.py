from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate


def list_addresses(db: Session, user: User) -> list[Address]:
    return db.scalars(select(Address).where(Address.user_id == user.id).order_by(Address.id.desc())).all()


def create_address(db: Session, user: User, payload: AddressCreate) -> Address:
    address = Address(user_id=user.id, **payload.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def update_address(db: Session, user: User, address_id: int, payload: AddressUpdate) -> Address:
    address = db.scalar(select(Address).where(Address.id == address_id, Address.user_id == user.id))
    if not address:
        raise HTTPException(status_code=404, detail="Endereco nao encontrado")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address


def delete_address(db: Session, user: User, address_id: int) -> None:
    address = db.scalar(select(Address).where(Address.id == address_id, Address.user_id == user.id))
    if not address:
        raise HTTPException(status_code=404, detail="Endereco nao encontrado")

    db.delete(address)
    db.commit()
