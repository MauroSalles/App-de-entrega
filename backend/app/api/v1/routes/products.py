from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter()


@router.get("/restaurant/{restaurant_id}", response_model=list[ProductOut])
def list_restaurant_products(
    restaurant_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")
    if user.role != UserRole.admin and restaurant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissao")
    return db.scalars(select(Product).where(Product.restaurant_id == restaurant_id)).all()


@router.post("", response_model=ProductOut)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == payload.restaurant_id))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante nao encontrado")
    if user.role != UserRole.admin and restaurant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Restaurante nao pertence ao usuario")

    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    product = db.scalar(select(Product).where(Product.id == product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == product.restaurant_id))
    if user.role != UserRole.admin and restaurant and restaurant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissao")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.dono_restaurante, UserRole.admin)),
):
    product = db.scalar(select(Product).where(Product.id == product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    restaurant = db.scalar(select(Restaurant).where(Restaurant.id == product.restaurant_id))
    if user.role != UserRole.admin and restaurant and restaurant.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissao")

    db.delete(product)
    db.commit()
    return {"message": "Produto removido"}
