import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["docs"] == "/docs"

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Travel Manager" in data["app"]

def test_auth_workflow():
    unique_email = f"user_test_{int(time.time())}@example.com"
    # Register
    reg_payload = {
        "name": "Maria Silva",
        "email": unique_email,
        "password": "senhaSegura123",
        "phone": "(11) 98765-4321"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code in [201, 400]

    # Login
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": unique_email, "password": "senhaSegura123"}
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Maria Silva"

    # Family
    fam_res = client.get("/api/v1/families/current", headers=headers)
    assert fam_res.status_code == 200
    assert "Família" in fam_res.json()["name"]

    # Create Trip
    trip_payload = {
        "title": "Férias em Gramado",
        "category": "nacional",
        "status": "planejamento",
        "start_date": "2026-11-20",
        "end_date": "2026-11-27",
        "main_destination": "Gramado",
        "description": "Viagem de inverno com a família"
    }
    trip_res = client.post("/api/v1/trips/", json=trip_payload, headers=headers)
    assert trip_res.status_code == 201
    trip = trip_res.json()
    trip_id = trip["id"]
    assert trip["title"] == "Férias em Gramado"

    # Destination
    dest_res = client.get(f"/api/v1/destinations/?trip_id={trip_id}", headers=headers)
    assert dest_res.status_code == 200
    dest_list = dest_res.json()
    assert len(dest_list) > 0

    # Attraction & Review
    attr_payload = {
        "name": "Parque Snowland",
        "category": "parque",
        "address": "RS-235, Gramado - RS",
        "is_favorite": True
    }
    attr_res = client.post("/api/v1/attractions/", json=attr_payload, headers=headers)
    assert attr_res.status_code == 201
    attr_id = attr_res.json()["id"]

    review_res = client.post(
        f"/api/v1/attractions/{attr_id}/reviews",
        json={"rating": 5, "comment": "Experiência sensacional para as crianças!"},
        headers=headers
    )
    assert review_res.status_code == 201

    # Activity (Scheduled & Unscheduled)
    act_payload = {
        "trip_id": trip_id,
        "title": "Passeio Snowland",
        "category": "passeio",
        "date": "2026-11-21",
        "estimated_cost": 300.00
    }
    act_res = client.post("/api/v1/activities/", json=act_payload, headers=headers)
    assert act_res.status_code == 201

    # Reservation with Auto Expense
    res_payload = {
        "trip_id": trip_id,
        "type": "hospedagem",
        "title": "Hotel Alpestre Gramado",
        "total_value": 1500.00,
        "booking_code": "ALP-9988",
        "payment_status": "pago"
    }
    res_res = client.post("/api/v1/reservations/?auto_create_expense=true", json=res_payload, headers=headers)
    assert res_res.status_code == 201

    # Financial Summary
    summary_res = client.get(f"/api/v1/finances/trip/{trip_id}/summary", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_spent"] >= 1500.00

    # Checklist Item
    check_payload = {
        "trip_id": trip_id,
        "title": "Separar casacos térmicos",
        "priority": "alta"
    }
    check_res = client.post("/api/v1/checklists/", json=check_payload, headers=headers)
    assert check_res.status_code == 201

    # Emergency Contact
    emerg_payload = {
        "name": "Dr. Carlos (Pediatra)",
        "phone": "(11) 99999-8888",
        "relationship_label": "Médico da Família"
    }
    emerg_res = client.post("/api/v1/emergency/", json=emerg_payload, headers=headers)
    assert emerg_res.status_code == 201

    # AI Chat
    ai_res = client.post(
        "/api/v1/ai/chat",
        json={"prompt": "Sugira um roteiro de 3 dias para Gramado", "trip_id": trip_id},
        headers=headers
    )
    assert ai_res.status_code == 200
    assert len(ai_res.json()["reply"]) > 50

    # Weather
    weather_res = client.get("/api/v1/integrations/weather?city=Gramado", headers=headers)
    assert weather_res.status_code == 200
    assert len(weather_res.json()["forecast"]) > 0

    # Calendar ICS Export
    ics_res = client.get(f"/api/v1/integrations/calendar/export-ics/{trip_id}", headers=headers)
    assert ics_res.status_code == 200
    assert "BEGIN:VCALENDAR" in ics_res.text

    # PDF and Excel Export
    pdf_res = client.get(f"/api/v1/reports/trip/{trip_id}/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"

    excel_res = client.get(f"/api/v1/reports/trip/{trip_id}/excel", headers=headers)
    assert excel_res.status_code == 200

    # Offline Sync Batch
    sync_payload = {
        "operations": [
            {
                "operation_id": "op-1",
                "entity_type": "expense",
                "action": "create",
                "client_timestamp": "2026-11-21T14:00:00Z",
                "payload": {
                    "trip_id": trip_id,
                    "title": "Café Colonial Bela Vista",
                    "category": "alimentacao",
                    "amount": 180.00,
                    "payment_status": "pago"
                }
            }
        ]
    }
    sync_res = client.post("/api/v1/sync/batch", json=sync_payload, headers=headers)
    assert sync_res.status_code == 200
    assert sync_res.json()["processed_count"] == 1

    # Backup creation
    backup_res = client.post("/api/v1/backup/create", headers=headers)
    assert backup_res.status_code == 200
    assert "backup_" in backup_res.json()["detail"]

    # Audit Logs
    audit_res = client.get("/api/v1/audit/logs", headers=headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()) > 0
