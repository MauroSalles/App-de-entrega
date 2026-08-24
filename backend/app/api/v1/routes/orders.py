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
from app.schemas.order import CartItemCreate, CartItemOut, OrderCreate, OrderItemInput, OrderOut, OrderStatusUpdate

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
    if not product.is_available:
        raise HTTPException(status_code=400, detail="Produto indisponivel")

    existing_items = db.scalars(select(CartItem).where(CartItem.user_id == user.id)).all()
    existing_products = db.scalars(
        select(Product).where(Product.id.in_([existing_item.product_id for existing_item in existing_items]))
    ).all()
    products_by_id = {existing_product.id: existing_product for existing_product in existing_products}
    for existing_item in existing_items:
        existing_product = products_by_id.get(existing_item.product_id)
        if existing_product and existing_product.restaurant_id != product.restaurant_id:
            db.delete(existing_item)

    item = db.scalar(select(CartItem).where(CartItem.user_id == user.id, CartItem.product_id == payload.product_id))
    if item:
        item.quantity += payload.quantity
    else:
        item = CartItem(user_id=user.id, product_id=payload.product_id, quantity=payload.quantity)
        db.add(item)

    db.commit()
    db.refresh(item)
    return {"id": item.id, "user_id": item.user_id, "product_id": item.product_id, "quantity": item.quantity}


@router.get("/cart/items", response_model=list[CartItemOut])
def list_cart_items(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.cliente)),
):
    items = db.scalars(select(CartItem).where(CartItem.user_id == user.id)).all()
    products = db.scalars(select(Product).where(Product.id.in_([item.product_id for item in items]))).all()
    products_by_id = {product.id: product for product in products}
    response: list[CartItemOut] = []
    for item in items:
        product = products_by_id.get(item.product_id)
        if not product:
            continue
        response.append(
            CartItemOut(
                id=item.id,
                product_id=product.id,
                restaurant_id=product.restaurant_id,
                product_name=product.name,
                quantity=item.quantity,
                unit_price=float(product.price),
                line_total=float(product.price) * item.quantity,
            )
        )
    return response


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

    input_items = payload.items
    if not input_items:
        cart_items = db.scalars(select(CartItem).where(CartItem.user_id == user.id)).all()
        input_items = [
            OrderItemInput(product_id=cart_item.product_id, quantity=cart_item.quantity) for cart_item in cart_items
        ]

    if not input_items:
        raise HTTPException(status_code=400, detail="Carrinho vazio")

    subtotal = 0.0
    order_items: list[OrderItem] = []
    for item in input_items:
        product = db.scalar(select(Product).where(Product.id == item.product_id))
        if not product or product.restaurant_id != payload.restaurant_id:
            raise HTTPException(status_code=400, detail=f"Produto {item.product_id} invalido")
        if not product.is_available:
            raise HTTPException(status_code=400, detail=f"Produto {item.product_id} indisponivel")
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

    cart_items = db.scalars(select(CartItem).where(CartItem.user_id == user.id)).all()
    for cart_item in cart_items:
        db.delete(cart_item)

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
