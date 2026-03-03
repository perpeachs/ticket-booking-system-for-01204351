import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate

from extensions import db, bcrypt
from models import User

app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'SQLALCHEMY_DATABASE_URI',
    'sqlite:///todos.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY',
    'fdslkfjsdlkufewhjroiewurewrew'
)


db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)


with app.app_context():
    db.create_all()


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
    email=email,
    username=username,
    password_hash=hashed_pw
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing username or password"}), 400

    user = User.query.filter_by(username=data["username"]).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Wrong password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "access_token": token
    }), 200


# ============ User Profile APIs ============

@app.route("/api/user/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "tokens": user.tokens,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }), 200


@app.route("/api/user/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    new_username = data.get("username")
    new_email = data.get("email")

    # Check if new username is already taken by another user
    if new_username and new_username != user.username:
        existing = User.query.filter_by(username=new_username).first()
        if existing:
            return jsonify({"error": "Username already taken"}), 400
        user.username = new_username

    # Check if new email is already taken by another user
    if new_email and new_email != user.email:
        existing = User.query.filter_by(email=new_email).first()
        if existing:
            return jsonify({"error": "Email already taken"}), 400
        user.email = new_email

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully",
        "username": user.username,
        "email": user.email
    }), 200


@app.route("/api/user/password", methods=["PUT"])
@jwt_required()
def update_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "Old password and new password are required"}), 400

    if not bcrypt.check_password_hash(user.password_hash, old_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200


if __name__ == "__main__":
    app.run(debug=True)