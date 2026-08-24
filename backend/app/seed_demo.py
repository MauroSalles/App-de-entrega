from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.address import Address
from app.models.enums import UserRole
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User


def _get_or_create_user(db, *, name: str, email: str, role: UserRole) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user:
        return user
    user = User(name=name, email=email, role=role, password_hash=get_password_hash("123456"))
    db.add(user)
    db.flush()
    return user


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        owner = _get_or_create_user(db, name="Restaurante Demo", email="owner@demo.com", role=UserRole.dono_restaurante)
        client = _get_or_create_user(db, name="Cliente Demo", email="client@demo.com", role=UserRole.cliente)
        _get_or_create_user(db, name="Entregador Demo", email="courier@demo.com", role=UserRole.entregador)

        restaurant = db.scalar(select(Restaurant).where(Restaurant.owner_user_id == owner.id))
        if not restaurant:
            restaurant = Restaurant(
                owner_user_id=owner.id,
                name="Massa Express",
                description="Massas e lanches para testes locais",
                delivery_fee=7.5,
                avg_delivery_time_min=35,
            )
            db.add(restaurant)
            db.flush()

        if not db.scalar(select(Address).where(Address.user_id == client.id)):
            db.add(
                Address(
                    user_id=client.id,
                    street="Rua das Flores",
                    number="123",
                    district="Centro",
                    city="Sao Paulo",
                    state="SP",
                    zip_code="01000-000",
                    complement="Apto 12",
                    reference="Proximo a praca",
                )
            )

        existing_product_names = {name for (name,) in db.execute(select(Product.name).where(Product.restaurant_id == restaurant.id))}
        for name, price, description in [
            ("Lasanha Bolonhesa", 34.9, "Porcao individual"),
            ("Spaghetti ao Molho Branco", 29.9, "Serve 1 pessoa"),
            ("Hamburguer Artesanal", 27.5, "Com fritas"),
        ]:
            if name not in existing_product_names:
                db.add(Product(restaurant_id=restaurant.id, name=name, description=description, price=price))

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
