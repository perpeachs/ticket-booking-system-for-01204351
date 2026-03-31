import pytest
from models import User
from main import db

def test_register_success(test_client, init_db):
    response = test_client.post("/api/auth/register", json={
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert "successfully" in data["message"]

    with test_client.application.app_context():
        user = User.query.filter_by(username="newuser").first()
        assert user is not None
        assert user.email == "newuser@example.com"

def test_register_duplicate_username(test_client, regular_user):
    response = test_client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "different@example.com",
        "password": "password123"
    })
    assert response.status_code == 400
    assert "Username already exists" in response.get_json()["error"]

def test_register_duplicate_email(test_client, regular_user):
    response = test_client.post("/api/auth/register", json={
        "username": "different",  
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 400
    assert "Email already exists" in response.get_json()["error"]

def test_login_success(test_client, regular_user):
    response = test_client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data
    assert "Login successful" in data["message"]

def test_login_wrong_password(test_client, regular_user):
    response = test_client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Wrong password" in response.get_json()["error"]

def test_login_user_not_found(test_client, init_db):
    response = test_client.post("/api/auth/login", json={
        "username": "nonexistent",
        "password": "password123"
    })
    assert response.status_code == 404
    assert "User not found" in response.get_json()["error"]
