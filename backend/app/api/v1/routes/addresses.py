from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.address import AddressCreate, AddressOut, AddressUpdate
from app.services.addresses import create_address, delete_address, list_addresses, update_address

router = APIRouter()


@router.get("", response_model=list[AddressOut])
def get_addresses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return list_addresses(db, user)


@router.post("", response_model=AddressOut)
def create_address_endpoint(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return create_address(db, user, payload)


@router.put("/{address_id}", response_model=AddressOut)
def update_address_endpoint(
    address_id: int,
    payload: AddressUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return update_address(db, user, address_id, payload)


@router.delete("/{address_id}")
def delete_address_endpoint(
    address_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    delete_address(db, user, address_id)
    return {"message": "Endereco removido"}
