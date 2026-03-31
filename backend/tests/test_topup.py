import pytest

def test_topup_success(test_client, auth_headers):
    response = test_client.post("/api/user/topup", headers=auth_headers, json={
        "amount": 150.0,
        "payment_method": "credit_card"
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Top-up successful"
    assert data["new_balance"] == 650.0

def test_topup_invalid_amount(test_client, auth_headers):
    response = test_client.post("/api/user/topup", headers=auth_headers, json={
        "amount": -50.0,
        "payment_method": "credit_card"
    })
    
    assert response.status_code == 400
    assert "Invalid amount" in response.get_json()["error"]

def test_topup_unauthorized(test_client):
    response = test_client.post("/api/user/topup", json={
        "amount": 100.0,
        "payment_method": "credit_card"
    })
    
    assert response.status_code == 401
    assert "Missing Authorization Header" in response.get_json()["msg"]
