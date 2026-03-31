import pytest
from models import Event, Zone, Booking, Payment
from main import db
from datetime import datetime

@pytest.fixture
def sample_event(init_db):
    event = Event(title="Test Concert", event_datetime=datetime.now(), status="available")
    db.session.add(event)
    db.session.commit()
    return event

@pytest.fixture
def sample_zone(init_db, sample_event):
    zone = Zone(event_id=sample_event.id, name="VIP", capacity=10, price=100.0)
    db.session.add(zone)
    db.session.commit()
    return zone

def test_create_booking_success(test_client, auth_headers, sample_zone, regular_user, test_app):
    with test_app.app_context():
        user = db.session.merge(regular_user)
        user.tokens = 500.0
        db.session.commit()

        initial_capacity = sample_zone.capacity
        
        response = test_client.post("/api/bookings", headers=auth_headers, json={
            "zone_id": sample_zone.id,
            "quantity": 2
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data["status"] == "paid"
        assert data["total_price"] == 200.0
        
        zone = Zone.query.get(sample_zone.id)
        assert zone.capacity == initial_capacity - 2
        
        updated_user = db.session.merge(regular_user)
        assert updated_user.tokens == 300.0

def test_create_booking_pending(test_client, auth_headers, sample_zone, regular_user, test_app):
    with test_app.app_context():
        user = db.session.merge(regular_user)
        user.tokens = 50.0
        db.session.commit()

        response = test_client.post("/api/bookings", headers=auth_headers, json={
            "zone_id": sample_zone.id,
            "quantity": 2
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data["status"] == "pending"
        
        updated_user = db.session.merge(regular_user)
        assert updated_user.tokens == 50.0

def test_create_booking_out_of_capacity(test_client, auth_headers, init_db, sample_event):
    zone = Zone(event_id=sample_event.id, name="LowCap", capacity=2, price=100.0)
    db.session.add(zone)
    db.session.commit()

    response = test_client.post("/api/bookings", headers=auth_headers, json={
        "zone_id": zone.id,
        "quantity": 3
    })
    
    assert response.status_code == 400
    assert "Insufficient capacity" in response.get_json()["error"]   
     
def test_create_booking_max_tickets(test_client, auth_headers, sample_zone):
    response = test_client.post("/api/bookings", headers=auth_headers, json={
        "zone_id": sample_zone.id,
        "quantity": 7
    })
    
    assert response.status_code == 400
    assert "Maximum 6 tickets" in response.get_json()["error"]

def test_cancel_booking(test_client, auth_headers, sample_zone, regular_user, test_app):
    with test_app.app_context():
        response = test_client.post("/api/bookings", headers=auth_headers, json={
            "zone_id": sample_zone.id,
            "quantity": 2
        })
        booking_id = response.get_json()["booking_id"]
        
        cancel_response = test_client.put(f"/api/user/bookings/{booking_id}/cancel", headers=auth_headers)
        assert cancel_response.status_code == 200
        
        zone = Zone.query.get(sample_zone.id)
        assert zone.capacity == 10  
        
        booking = Booking.query.get(booking_id)
        assert booking.status == "canceled"
        
        updated_user = db.session.merge(regular_user)
        assert updated_user.tokens == 500.0
