from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.address import Address
from app.models.delivery import Delivery
from app.models.enums import OrderStatus, UserRole
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate


def create_order(db: Session, payload: OrderCreate, user: User) -> Order:
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == payload.restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")

    address = db.scalar(select(Address).where(Address.id == payload.delivery_address_id, Address.user_id == user.id))
    if not address:
        raise HTTPException(status_code=404, detail="Endereco nao encontrado")

    if not payload.items:
        raise HTTPException(status_code=400, detail="Pedido sem itens")

    subtotal = 0.0
    order_items: list[OrderItem] = []
    for item in payload.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantidade invalida")
        product = db.scalar(select(Product).where(Product.id == item.product_id))
        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.product_id} nao encontrado")
        if product.restaurant_id != payload.restaurant_id or not product.is_available:
            raise HTTPException(status_code=400, detail=f"Produto {item.product_id} invalido")
        line = float(product.price) * item.quantity
        subtotal += line
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
                item_note=item.item_note,
            )
        )

    total = subtotal + float(restaurant.delivery_fee)

    order = Order(
        client_user_id=user.id,
        restaurant_id=payload.restaurant_id,
        delivery_address_id=payload.delivery_address_id,
        status=OrderStatus.recebido,
        subtotal=subtotal,
        delivery_fee=restaurant.delivery_fee,
        total=total,
        notes=payload.notes,
    )
    db.add(order)
    db.flush()

    for order_item in order_items:
        order_item.order_id = order.id
        db.add(order_item)

    db.add(Delivery(order_id=order.id))
    db.commit()
    db.refresh(order)
    return order


def list_my_orders(db: Session, user: User) -> list[Order]:
    if user.role == UserRole.cliente:
        return db.scalars(select(Order).where(Order.client_user_id == user.id).order_by(Order.id.desc())).all()
    if user.role == UserRole.dono_restaurante:
        restaurants = db.scalars(select(Restaurant).where(Restaurant.owner_user_id == user.id)).all()
        restaurant_ids = [restaurant.id for restaurant in restaurants]
        if not restaurant_ids:
            return []
        return db.scalars(select(Order).where(Order.restaurant_id.in_(restaurant_ids)).order_by(Order.id.desc())).all()
    if user.role == UserRole.admin:
        return db.scalars(select(Order).order_by(Order.id.desc())).all()
    return []


def update_order_status(db: Session, order_id: int, payload: OrderStatusUpdate, user: User) -> Order:
    order = db.scalar(select(Order).where(Order.id == order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Pedido nao encontrado")

    if user.role == UserRole.dono_restaurante:
        restaurant = db.scalar(select(Restaurant).where(Restaurant.id == order.restaurant_id))
        if not restaurant or restaurant.owner_user_id != user.id:
            raise HTTPException(status_code=403, detail="Sem permissao")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
