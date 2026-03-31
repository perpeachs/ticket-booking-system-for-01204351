import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

import pytest
from main import app, db
import mongomock
from unittest.mock import patch
from models import User
from extensions import bcrypt

@pytest.fixture(scope="session")
def test_app():
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test_secret_key",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    })
    
    with patch("mongo.transactions_collection", new=mongomock.MongoClient().db.transactions), \
         patch("mongo.user_stats_collection", new=mongomock.MongoClient().db.user_stats):
        
        with patch("main.transactions_collection", new=mongomock.MongoClient().db.transactions), \
             patch("main.user_stats_collection", new=mongomock.MongoClient().db.user_stats):
            yield app

@pytest.fixture(scope="function")
def test_client(test_app):
    return test_app.test_client()

@pytest.fixture(scope="function")
def init_db(test_app):
    with test_app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope="function")
def regular_user(init_db):
    hashed_pw = bcrypt.generate_password_hash("password123").decode("utf-8")
    user = User(username="testuser", email="test@example.com", password_hash=hashed_pw)
    user.tokens = 500.0
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture(scope="function")
def admin_user(init_db):
    hashed_pw = bcrypt.generate_password_hash("adminpass").decode("utf-8")
    user = User(username="adminuser", email="admin@example.com", password_hash=hashed_pw, role="admin")
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture(scope="function")
def auth_headers(test_client, regular_user, test_app):
    from flask_jwt_extended import create_access_token
    with test_app.app_context():
        token = create_access_token(identity=str(regular_user.id))
        return {"Authorization": f"Bearer {token}"}
