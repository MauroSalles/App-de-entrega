from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.delivery import (
    AssignCourierInput,
    DeliveryLocationInput,
    DeliveryOut,
    DeliveryStatusUpdate,
)
from app.services.deliveries import assign_courier, list_active_deliveries, update_delivery_status, update_location

router = APIRouter()


@router.patch("/orders/{order_id}/assign-courier", response_model=DeliveryOut)
def assign_courier_endpoint(
    order_id: int,
    payload: AssignCourierInput,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return assign_courier(db, order_id, payload, user)


@router.patch("/deliveries/{delivery_id}/status", response_model=DeliveryOut)
def update_delivery_status_endpoint(
    delivery_id: int,
    payload: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.entregador, UserRole.admin)),
):
    return update_delivery_status(db, delivery_id, payload, user)


@router.post("/deliveries/{delivery_id}/location")
def update_location_endpoint(
    delivery_id: int,
    payload: DeliveryLocationInput,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.entregador, UserRole.admin)),
):
    update_location(db, delivery_id, payload, user)
    return {"message": "Localizacao registrada"}


@router.get("/deliveries/me/active", response_model=list[DeliveryOut])
def active_deliveries(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.entregador)),
):
    return list_active_deliveries(db, user)
