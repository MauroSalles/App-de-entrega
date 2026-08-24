from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.address import Address
from app.models.delivery import Delivery
from app.models.enums import OrderStatus, UserRole
from app.models.order import CartItem, Order, OrderItem
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.order import CartItemCreate, OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter()


@router.post("/cart/items")
def add_cart_item(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    product = db.scalar(select(Product).where(Product.id == payload.product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    item = CartItem(user_id=user.id, product_id=payload.product_id, quantity=payload.quantity)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "user_id": item.user_id, "product_id": item.product_id, "quantity": item.quantity}


@router.delete("/cart/items/{item_id}")
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user.id))
    if not item:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Item removido"}


@router.post("/orders", response_model=OrderOut)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == payload.restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")

    address = db.scalar(select(Address).where(Address.id == payload.delivery_address_id, Address.user_id == user.id))
    if not address:
        raise HTTPException(status_code=404, detail="Endereco nao encontrado")

    subtotal = 0.0
    order_items: list[OrderItem] = []
    for item in payload.items:
        product = db.scalar(select(Product).where(Product.id == item.product_id))
        if not product or product.restaurant_id != payload.restaurant_id:
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

    delivery = Delivery(order_id=order.id)
    db.add(delivery)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/me", response_model=list[OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role == UserRole.cliente:
        return db.scalars(select(Order).where(Order.client_user_id == user.id)).all()
    if user.role == UserRole.dono_restaurante:
        restaurants = db.scalars(select(Restaurant).where(Restaurant.owner_user_id == user.id)).all()
        restaurant_ids = [r.id for r in restaurants]
        if not restaurant_ids:
            return []
        return db.scalars(select(Order).where(Order.restaurant_id.in_(restaurant_ids))).all()
    if user.role == UserRole.admin:
        return db.scalars(select(Order)).all()
    return []


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
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
