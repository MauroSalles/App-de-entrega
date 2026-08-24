import os
import tempfile
import unittest
from pathlib import Path

os.environ.setdefault("DATABASE_URL", "sqlite:///./placeholder.db")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.api.deps import get_db
from app.core.security import get_password_hash
from app.db.base import Base
from app.main import app
from app.models.delivery import Delivery, DeliveryTracking
from app.models.enums import DeliveryStatus, UserRole
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User


class DeliveryApiTestCase(unittest.TestCase):
    PASSWORD = "123456"

    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp(prefix="delivery-test-", suffix=".db")
        self.engine = create_engine(
            f"sqlite:///{self.db_path}",
            connect_args={"check_same_thread": False},
            future=True,
        )
        self.SessionTesting = sessionmaker(bind=self.engine, autoflush=False, autocommit=False, future=True)
        Base.metadata.create_all(self.engine)

        def override_get_db():
            db = self.SessionTesting()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()
        os.close(self.db_fd)
        Path(self.db_path).unlink(missing_ok=True)

    def _register(self, *, name: str, email: str, role: str):
        response = self.client.post(
            "/api/v1/auth/register",
            json={"name": name, "email": email, "password": self.PASSWORD, "role": role},
        )
        self.assertEqual(response.status_code, 200)
        return response.json()

    def _login(self, *, email: str) -> str:
        response = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": self.PASSWORD},
        )
        self.assertEqual(response.status_code, 200)
        return response.json()["access_token"]

    def _auth_headers(self, token: str) -> dict[str, str]:
        return {"Authorization": "Bearer " + token}

    def _create_restaurant_bundle(self, *, owner_name: str = "Owner", owner_email: str = "owner@test.com"):
        with self.SessionTesting() as db:
            owner = User(
                name=owner_name,
                email=owner_email,
                role=UserRole.dono_restaurante,
                password_hash=get_password_hash(self.PASSWORD),
            )
            db.add(owner)
            db.flush()
            restaurant = Restaurant(
                owner_user_id=owner.id,
                name="Massa Teste",
                description="Restaurante teste",
                delivery_fee=5,
                avg_delivery_time_min=30,
            )
            db.add(restaurant)
            db.flush()
            product = Product(
                restaurant_id=restaurant.id,
                name="Pizza",
                description="Grande",
                price=40,
                is_available=True,
            )
            db.add(product)
            db.commit()
            return {"owner_id": owner.id, "restaurant_id": restaurant.id, "product_id": product.id}

    def test_register_and_login_flow(self):
        created_user = self._register(
            name="Cliente Teste",
            email="cliente@test.com",
            role="cliente",
        )
        self.assertEqual(created_user["email"], "cliente@test.com")

        token = self._login(email="cliente@test.com")
        me_response = self.client.get("/api/v1/auth/me", headers=self._auth_headers(token))
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()["role"], "cliente")

    def test_client_can_create_order_with_real_address(self):
        bundle = self._create_restaurant_bundle()
        self._register(name="Cliente", email="cliente@pedido.com", role="cliente")
        token = self._login(email="cliente@pedido.com")

        address_response = self.client.post(
            "/api/v1/addresses",
            json={
                "street": "Rua A",
                "number": "100",
                "district": "Centro",
                "city": "Sao Paulo",
                "state": "SP",
                "zip_code": "01000-000",
                "complement": "Casa",
                "reference": "Portao azul",
            },
            headers=self._auth_headers(token),
        )
        self.assertEqual(address_response.status_code, 200)
        address_id = address_response.json()["id"]

        order_response = self.client.post(
            "/api/v1/orders",
            json={
                "restaurant_id": bundle["restaurant_id"],
                "delivery_address_id": address_id,
                "items": [{"product_id": bundle["product_id"], "quantity": 2}],
            },
            headers=self._auth_headers(token),
        )
        self.assertEqual(order_response.status_code, 200)
        self.assertEqual(order_response.json()["delivery_address_id"], address_id)

        my_orders_response = self.client.get("/api/v1/orders/me", headers=self._auth_headers(token))
        self.assertEqual(my_orders_response.status_code, 200)
        self.assertEqual(len(my_orders_response.json()), 1)

    def test_owner_assigns_courier_and_courier_updates_delivery(self):
        bundle = self._create_restaurant_bundle(owner_email="owner@flow.com")
        self._register(name="Cliente", email="cliente@flow.com", role="cliente")
        self._register(name="Courier", email="courier@flow.com", role="entregador")

        client_token = self._login(email="cliente@flow.com")
        owner_token = self._login(email="owner@flow.com")
        courier_token = self._login(email="courier@flow.com")

        address_response = self.client.post(
            "/api/v1/addresses",
            json={
                "street": "Rua B",
                "number": "200",
                "district": "Centro",
                "city": "Campinas",
                "state": "SP",
                "zip_code": "13000-000",
            },
            headers=self._auth_headers(client_token),
        )
        self.assertEqual(address_response.status_code, 200)

        order_response = self.client.post(
            "/api/v1/orders",
            json={
                "restaurant_id": bundle["restaurant_id"],
                "delivery_address_id": address_response.json()["id"],
                "items": [{"product_id": bundle["product_id"], "quantity": 1}],
            },
            headers=self._auth_headers(client_token),
        )
        self.assertEqual(order_response.status_code, 200)
        order_id = order_response.json()["id"]

        with self.SessionTesting() as db:
            courier_id = db.scalar(select(User.id).where(User.email == "courier@flow.com"))

        assign_response = self.client.patch(
            f"/api/v1/orders/{order_id}/assign-courier",
            json={"courier_user_id": courier_id},
            headers=self._auth_headers(owner_token),
        )
        self.assertEqual(assign_response.status_code, 200)
        delivery_id = assign_response.json()["id"]

        active_deliveries_response = self.client.get(
            "/api/v1/deliveries/me/active",
            headers=self._auth_headers(courier_token),
        )
        self.assertEqual(active_deliveries_response.status_code, 200)
        self.assertEqual(len(active_deliveries_response.json()), 1)

        status_response = self.client.patch(
            f"/api/v1/deliveries/{delivery_id}/status",
            json={"status": "retirado"},
            headers=self._auth_headers(courier_token),
        )
        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.json()["status"], "retirado")

        location_response = self.client.post(
            f"/api/v1/deliveries/{delivery_id}/location",
            json={"latitude": -23.55, "longitude": -46.63, "status": "em_rota"},
            headers=self._auth_headers(courier_token),
        )
        self.assertEqual(location_response.status_code, 200)

        with self.SessionTesting() as db:
            delivery = db.scalar(select(Delivery).where(Delivery.id == delivery_id))
            tracking_rows = db.scalars(select(DeliveryTracking).where(DeliveryTracking.delivery_id == delivery_id)).all()
            self.assertEqual(delivery.courier_user_id, courier_id)
            self.assertEqual(delivery.status, DeliveryStatus.retirado)
            self.assertEqual(len(tracking_rows), 1)

    def test_create_order_returns_404_when_product_does_not_exist(self):
        bundle = self._create_restaurant_bundle()
        self._register(name="Cliente", email="cliente@404.com", role="cliente")
        token = self._login(email="cliente@404.com")

        address_response = self.client.post(
            "/api/v1/addresses",
            json={
                "street": "Rua C",
                "number": "300",
                "district": "Centro",
                "city": "Santos",
                "state": "SP",
                "zip_code": "11000-000",
            },
            headers=self._auth_headers(token),
        )
        self.assertEqual(address_response.status_code, 200)

        order_response = self.client.post(
            "/api/v1/orders",
            json={
                "restaurant_id": bundle["restaurant_id"],
                "delivery_address_id": address_response.json()["id"],
                "items": [{"product_id": 999999, "quantity": 1}],
            },
            headers=self._auth_headers(token),
        )
        self.assertEqual(order_response.status_code, 404)
        self.assertIn("nao encontrado", order_response.json()["detail"])

    def test_update_location_validates_latitude_and_longitude(self):
        bundle = self._create_restaurant_bundle(owner_email="owner@coords.com")
        self._register(name="Cliente", email="cliente@coords.com", role="cliente")
        self._register(name="Courier", email="courier@coords.com", role="entregador")

        client_token = self._login(email="cliente@coords.com")
        owner_token = self._login(email="owner@coords.com")
        courier_token = self._login(email="courier@coords.com")

        address_response = self.client.post(
            "/api/v1/addresses",
            json={
                "street": "Rua D",
                "number": "400",
                "district": "Centro",
                "city": "Sao Vicente",
                "state": "SP",
                "zip_code": "11300-000",
            },
            headers=self._auth_headers(client_token),
        )
        self.assertEqual(address_response.status_code, 200)

        order_response = self.client.post(
            "/api/v1/orders",
            json={
                "restaurant_id": bundle["restaurant_id"],
                "delivery_address_id": address_response.json()["id"],
                "items": [{"product_id": bundle["product_id"], "quantity": 1}],
            },
            headers=self._auth_headers(client_token),
        )
        self.assertEqual(order_response.status_code, 200)
        order_id = order_response.json()["id"]

        with self.SessionTesting() as db:
            courier_id = db.scalar(select(User.id).where(User.email == "courier@coords.com"))

        assign_response = self.client.patch(
            f"/api/v1/orders/{order_id}/assign-courier",
            json={"courier_user_id": courier_id},
            headers=self._auth_headers(owner_token),
        )
        self.assertEqual(assign_response.status_code, 200)
        delivery_id = assign_response.json()["id"]

        invalid_lat_response = self.client.post(
            f"/api/v1/deliveries/{delivery_id}/location",
            json={"latitude": 120, "longitude": -46.63, "status": "em_rota"},
            headers=self._auth_headers(courier_token),
        )
        self.assertEqual(invalid_lat_response.status_code, 422)

        invalid_lng_response = self.client.post(
            f"/api/v1/deliveries/{delivery_id}/location",
            json={"latitude": -23.55, "longitude": 200, "status": "em_rota"},
            headers=self._auth_headers(courier_token),
        )
        self.assertEqual(invalid_lng_response.status_code, 422)
