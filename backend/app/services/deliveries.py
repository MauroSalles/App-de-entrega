from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.delivery import Delivery, DeliveryTracking
from app.models.enums import DeliveryStatus, UserRole
from app.models.order import Order
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.delivery import AssignCourierInput, DeliveryLocationInput, DeliveryStatusUpdate


def assign_courier(db: Session, order_id: int, payload: AssignCourierInput, user: User) -> Delivery:
    order = db.scalar(select(Order).where(Order.id == order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Pedido nao encontrado")

    if user.role == UserRole.dono_restaurante:
        restaurant = db.scalar(select(Restaurant).where(Restaurant.id == order.restaurant_id))
        if not restaurant or restaurant.owner_user_id != user.id:
            raise HTTPException(status_code=403, detail="Sem permissao")

    delivery = db.scalar(select(Delivery).where(Delivery.order_id == order_id))
    if not delivery:
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


def update_delivery_status(db: Session, delivery_id: int, payload: DeliveryStatusUpdate, user: User) -> Delivery:
    delivery = db.scalar(select(Delivery).where(Delivery.id == delivery_id))
    if not delivery:
        raise HTTPException(status_code=404, detail="Entrega nao encontrada")

    if user.role == UserRole.entregador and delivery.courier_user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissao")

    delivery.status = payload.status
    if payload.status == DeliveryStatus.retirado and not delivery.started_at:
        delivery.started_at = datetime.now(timezone.utc)
    if payload.status == DeliveryStatus.entregue:
        delivery.delivered_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(delivery)
    return delivery


def update_location(db: Session, delivery_id: int, payload: DeliveryLocationInput, user: User) -> None:
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


def list_active_deliveries(db: Session, user: User) -> list[Delivery]:
    return db.scalars(
        select(Delivery).where(
            Delivery.courier_user_id == user.id,
            Delivery.status.in_([DeliveryStatus.aguardando_retirada, DeliveryStatus.retirado, DeliveryStatus.em_rota]),
        )
    ).all()
