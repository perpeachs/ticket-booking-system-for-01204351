from flask import Flask, request, jsonify
from extensions import db, bcrypt
from models import User

app = Flask(__name__)

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = User(
        username=data["username"],
        email=data["email"],
        password_hash=hashed
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"})


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"error": "Invalid"}), 401

    return jsonify({"message": "Login success"})