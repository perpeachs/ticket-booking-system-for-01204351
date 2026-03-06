import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate
from datetime import datetime

from extensions import db, bcrypt
from models import User, Booking, Zone, Event, Payment
#from expiration_manager import start_expiration_scheduler

app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')


db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)


with app.app_context():
    db.create_all()
    #start_expiration_scheduler(app)


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

    if user.deleted_at:
        return jsonify({"error": "User is deleted"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "access_token": token
    }), 200


# ============ Concerts APIs ============

@app.route("/api/concerts", methods=["GET"])
@jwt_required()
def get_concerts():
    events = Event.query.all()
    result = []
    for event in events:
        result.append({
            "id": event.id,
            "name": event.title,
            "date": event.event_datetime.strftime("%d %B %Y"),
            "location": event.location,
            "image": event.image_url or "https://picsum.photos/400/250?random=" + str(event.id),
            "status": event.status
        })
    return jsonify(result), 200


@app.route("/api/concerts/<int:event_id>/zones", methods=["GET"])
@jwt_required()
def get_zones(event_id):
    zones = Zone.query.filter_by(event_id=event_id, is_available=True).all()
    result = []
    for zone in zones:
        result.append({
            "id": zone.id,
            "name": zone.name,
            "capacity": zone.capacity,
            "price": zone.price,
            "is_available": zone.is_available
        })
    return jsonify(result), 200

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

# ============ Bookings APIs ============

@app.route("/api/user/bookings", methods=["GET"])
@jwt_required()
def get_bookings():
    user_id = get_jwt_identity()
    bookings = Booking.query.filter(Booking.user_id == int(user_id), Booking.status != "canceled").order_by(Booking.status.desc(), Booking.created_at.desc()).all()

    result = []
    for b in bookings:
        zone = Zone.query.get(b.zone_id)
        event = Event.query.get(zone.event_id)
        payment = Payment.query.get(b.payment_id)

        result.append({
            "id": b.id,
            "concertName": event.title,
            "date": event.event_datetime.strftime("%d %B %Y"),
            "zone": zone.name,
            "quantity": b.quantity,
            "price": payment.total_price,
            "status": b.status,
            "created_at": b.created_at.isoformat(),
        })

    return jsonify(result), 200


@app.route("/api/bookings", methods=["POST"])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    data = request.get_json()

    zone_id = data.get("zone_id")
    quantity = data.get("quantity")

    if not zone_id or not quantity:
        return jsonify({"error": "Missing zone_id or quantity"}), 400

    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({"error": "Quantity must be a positive integer"}), 400

    if quantity > 6:
        return jsonify({"error": "Maximum 6 tickets allowed per booking"}), 400

    try:
        # Use with_for_update() to lock the zone record and prevent race conditions
        zone = Zone.query.filter_by(id=zone_id).with_for_update().first()

        if not zone:
            return jsonify({"error": "Zone not found"}), 404

        if zone.capacity < quantity:
            return jsonify({
                "error": "Insufficient capacity",
                "available": zone.capacity
            }), 400

        user = User.query.get(user_id)
        total_price = zone.price * quantity

        # Determine status based on tokens
        if user.tokens >= total_price:
            user.tokens -= total_price
            payment_status = "success"
            booking_status = "paid"
            paid_at = datetime.utcnow()
        else:
            payment_status = "pending"
            booking_status = "pending"
            paid_at = None

        # Create Payment
        payment = Payment(
            total_price=total_price,
            status=payment_status,
            paid_at=paid_at
        )
        db.session.add(payment)
        db.session.flush()

        # Create Booking
        booking = Booking(
            user_id=int(user_id),
            zone_id=zone_id,
            payment_id=payment.id,
            quantity=quantity,
            status=booking_status
        )
        db.session.add(booking)

        # Update Zone Capacity
        zone.capacity -= quantity

        # logs transaction booking and payment

        db.session.commit()

        return jsonify({
            "message": "Booking created successfully",
            "booking_id": booking.id,
            "status": booking_status,
            "total_price": total_price
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route("/api/user/bookings/<int:booking_id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_booking(booking_id):
    user_id = get_jwt_identity()
    booking = Booking.query.filter_by(id=booking_id, user_id=int(user_id)).first()

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.status == "canceled":
        return jsonify({"error": "Booking is already canceled"}), 400

    if booking.status == "expired":
        return jsonify({"error": "Booking is already expired"}), 400

    try:
        zone = Zone.query.get(booking.zone_id)
        zone.capacity += booking.quantity

        payment = Payment.query.get(booking.payment_id)
        payment.status = "refunded"

        user = User.query.get(booking.user_id)
        user.tokens += payment.total_price

        #log_transaction(
        #    user_id=int(user_id),
        #    action="ticket",
        #    details={
        #        "status": "cancel_and_refund",
        #        "booking_id": booking.id,
        #        "amount_refunded": payment.total_price
        #    }
        #)

        booking.status = "canceled"
        db.session.commit()

        return jsonify({"message": "Booking canceled successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route("/api/user/bookings/<int:booking_id>/paid", methods=["PUT"])
@jwt_required()
def paid_booking(booking_id):
    user_id = get_jwt_identity()
    booking = Booking.query.filter_by(id=booking_id, user_id=int(user_id)).first()

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.status != "pending":
        return jsonify({"error": f"Booking is already {booking.status}"}), 400

    user = User.query.get(user_id)
    payment = Payment.query.get(booking.payment_id)

    if user.tokens < payment.total_price:
        return jsonify({"error": "Insufficient tokens"}), 400

    try:
        user.tokens -= payment.total_price

        booking.status = "paid"
        payment.status = "success"
        payment.paid_at = datetime.utcnow()

        # log_transaction(
        #     user_id=int(user_id),
        #     action="payment",
        #     details={
        #         "status": "success",
        #         "booking_id": booking.id,
        #         "amount_paid": payment.total_price
        #     }
        # )

        db.session.commit()
        return jsonify({"message": "Booking paid successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route("/api/user/topup", methods=["POST"])
@jwt_required()
def topup():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    amount = data.get("amount")
    paymentMethod = data.get("payment_method")

    if amount is None or not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    try:
        user.tokens += amount
        db.session.commit()

        # log_transaction(
        #     user_id=int(user_id),
        #     action="topup",
        #     details={
        #         "amount": amount,
        #         "new_balance": user.tokens,
        #         "payment_method": paymentMethod
        #     }
        # )

        return jsonify({
            "message": "Top-up successful",
            "new_balance": user.tokens
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.cli.command("recreate-db")
def recreate_db_command():
    """Drops and recreates all database tables."""
    db.drop_all()
    db.create_all()
    print("Database recreated successfully!")


if __name__ == "__main__":
    app.run(debug=True)