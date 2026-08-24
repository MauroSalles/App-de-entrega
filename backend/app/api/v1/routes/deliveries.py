from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.delivery import Delivery, DeliveryTracking
from app.models.enums import DeliveryStatus, UserRole
from app.models.order import Order
from app.models.user import User
from app.schemas.delivery import (
    AssignCourierInput,
    DeliveryLocationInput,
    DeliveryOut,
    DeliveryStatusUpdate,
)

router = APIRouter()


@router.patch("/orders/{order_id}/assign-courier", response_model=DeliveryOut)
def assign_courier(
    order_id: int,
    payload: AssignCourierInput,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    delivery = db.scalar(select(Delivery).where(Delivery.order_id == order_id))
    if not delivery:
        order = db.scalar(select(Order).where(Order.id == order_id))
        if not order:
            raise HTTPException(status_code=404, detail="Pedido nao encontrado")
        delivery = Delivery(order_id=order.id)
        db.add(delivery)
        db.flush()

    courier = db.scalar(select(User).where(User.id == payload.courier_user_id))
    if not courier or courier.role != UserRole.entregador:
        raise HTTPException(status_code=400, detail="Entregador invalido")

    delivery.courier_user_id = payload.courier_user_id
    db.commit()
    db.refresh(delivery)
    return delivery


@router.patch("/deliveries/{delivery_id}/status", response_model=DeliveryOut)
def update_delivery_status(
    delivery_id: int,
    payload: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.entregador, UserRole.admin)),
):
    delivery = db.scalar(select(Delivery).where(Delivery.id == delivery_id))
    if not delivery:
        raise HTTPException(status_code=404, detail="Entrega nao encontrada")

    if user.role == UserRole.entregador and delivery.courier_user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissao")

    delivery.status = payload.status
    if payload.status == DeliveryStatus.retirado and not delivery.started_at:
        delivery.started_at = datetime.utcnow()
    if payload.status == DeliveryStatus.entregue:
        delivery.delivered_at = datetime.utcnow()

    db.commit()
    db.refresh(delivery)
    return delivery


@router.post("/deliveries/{delivery_id}/location")
def update_location(
    delivery_id: int,
    payload: DeliveryLocationInput,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.entregador, UserRole.admin)),
):
    delivery = db.scalar(select(Delivery).where(Delivery.id == delivery_id))
    if not delivery:
        raise HTTPException(status_code=404, detail="Entrega nao encontrada")
    if user.role == UserRole.entregador and delivery.courier_user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissao")

    tracking = DeliveryTracking(
        delivery_id=delivery.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status=payload.status,
    )
    db.add(tracking)
    db.commit()
    return {"message": "Localizacao registrada"}


@router.get("/deliveries/me/active", response_model=list[DeliveryOut])
def active_deliveries(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.entregador)),
):
    return db.scalars(
        select(Delivery).where(
            Delivery.courier_user_id == user.id,
            Delivery.status.in_([DeliveryStatus.aguardando_retirada, DeliveryStatus.retirado, DeliveryStatus.em_rota]),
        )
    ).all()
