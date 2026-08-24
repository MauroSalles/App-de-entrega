from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.order import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import CartItemCreate, OrderCreate, OrderOut, OrderStatusUpdate
from app.services.orders import create_order, list_my_orders, update_order_status

router = APIRouter()


@router.post("/cart/items")
def add_cart_item(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    product = db.scalar(select(Product).where(Product.id == payload.product_id, Product.is_available.is_(True)))
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    item = db.scalar(select(CartItem).where(CartItem.user_id == user.id, CartItem.product_id == payload.product_id))
    if item:
        item.quantity += payload.quantity
    else:
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
def create_order_endpoint(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    return create_order(db, payload, user)


@router.get("/orders/me", response_model=list[OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return list_my_orders(db, user)


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status_endpoint(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    return update_order_status(db, order_id, payload, user)
