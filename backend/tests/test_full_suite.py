import time
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_modules_suite():
    email = f"family_admin_{int(time.time())}@example.com"
    # 1. Register & Login
    r_reg = client.post("/api/v1/auth/register", json={
        "name": "Carlos Eduardo",
        "email": email,
        "password": "senhaForteFamilia123",
        "phone": "(11) 91234-5678"
    })
    assert r_reg.status_code == 201

    r_login = client.post("/api/v1/auth/login", data={"username": email, "password": "senhaForteFamilia123"})
    assert r_login.status_code == 200
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Family Invite Flow
    r_inv = client.post("/api/v1/families/invites", json={"email": "primo@example.com"}, headers=headers)
    assert r_inv.status_code == 201
    invite_token = r_inv.json()["token"]

    # 3. Create second user to accept invite
    primo_email = f"primo_{int(time.time())}@example.com"
    r_reg_primo = client.post("/api/v1/auth/register", json={
        "name": "Primo Joao",
        "email": primo_email,
        "password": "senhaPrimo123"
    })
    primo_token = r_reg_primo.json()["access_token"]
    primo_headers = {"Authorization": f"Bearer {primo_token}"}

    r_accept = client.post(f"/api/v1/families/invites/{invite_token}/accept", headers=primo_headers)
    assert r_accept.status_code == 200

    # 4. Catalog Destination vs Trip Destination
    r_cat_dest = client.post("/api/v1/destinations/", json={
        "city": "Paris",
        "country": "França",
        "is_catalog": True,
        "description": "Cidade Luz"
    }, headers=headers)
    assert r_cat_dest.status_code == 201

    r_get_cat = client.get("/api/v1/destinations/catalog", headers=headers)
    assert r_get_cat.status_code == 200
    assert any(d["city"] == "Paris" for d in r_get_cat.json())

    # 5. Create Trip with Destination & Participants
    r_trip = client.post("/api/v1/trips/", json={
        "title": "Eurotrip Família",
        "category": "internacional",
        "status": "planejamento",
        "start_date": "2027-06-01",
        "end_date": "2027-06-20",
        "main_destination": "Paris"
    }, headers=headers)
    assert r_trip.status_code == 201
    trip_id = r_trip.json()["id"]

    # Add external participant
    r_part = client.post(f"/api/v1/trips/{trip_id}/participants", json={
        "name": "Amigo Convidado",
        "email": "amigo@example.com",
        "is_external": True
    }, headers=headers)
    assert r_part.status_code == 201

    # 6. Budget and Multi-category Expenses
    client.post("/api/v1/finances/budgets", json={
        "trip_id": trip_id,
        "category": "passagens",
        "budgeted_amount": 10000.00
    }, headers=headers)

    client.post("/api/v1/finances/budgets", json={
        "trip_id": trip_id,
        "category": "hospedagem",
        "budgeted_amount": 8000.00
    }, headers=headers)

    client.post("/api/v1/finances/expenses", json={
        "trip_id": trip_id,
        "title": "Passagens Air France",
        "category": "passagens",
        "amount": 9500.00,
        "date": "2026-12-01",
        "payment_status": "pago"
    }, headers=headers)

    r_fin_sum = client.get(f"/api/v1/finances/trip/{trip_id}/summary", headers=headers)
    assert r_fin_sum.status_code == 200
    sum_data = r_fin_sum.json()
    assert sum_data["total_budget"] == 18000.00
    assert sum_data["total_spent"] == 9500.00
    assert sum_data["balance"] == 8500.00

    # 7. Luggage Items by category
    r_lug = client.post("/api/v1/checklists/luggage", json={
        "trip_id": trip_id,
        "user_id": r_reg.json()["user"]["id"],
        "description": "Casaco de Lã",
        "category": "roupas",
        "quantity": 2
    }, headers=headers)
    assert r_lug.status_code == 201

    r_lug_list = client.get(f"/api/v1/checklists/luggage/{trip_id}", headers=headers)
    assert r_lug_list.status_code == 200
    assert len(r_lug_list.json()) > 0

    # 8. Google Photo Album association (RF32)
    r_album = client.post("/api/v1/integrations/photos", json={
        "trip_id": trip_id,
        "title": "Fotos Paris 2027",
        "album_url": "https://photos.google.com/share/test_album_123"
    }, headers=headers)
    assert r_album.status_code == 201

    r_album_list = client.get(f"/api/v1/integrations/photos/{trip_id}", headers=headers)
    assert r_album_list.status_code == 200
    assert len(r_album_list.json()) == 1

    # 9. Conclude Trip (RF37)
    r_finish = client.post(f"/api/v1/trips/{trip_id}/finish?general_rating=4.8&review_comments=Excelente", headers=headers)
    assert r_finish.status_code == 200
    assert r_finish.json()["status"] == "realizada"
    assert r_finish.json()["general_rating"] == 4.8

