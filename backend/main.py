import os
import click
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate

from extensions import db, bcrypt
from models import User, Booking, Zone, Event, Payment
from expiration_manager import start_expiration_scheduler

from mongo import transactions_collection, user_stats_collection
from bson import ObjectId
from transaction_service import log_transaction
app = Flask(__name__)
CORS(app)


#app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    "SQLALCHEMY_DATABASE_URI",
    "mysql+pymysql://user:password@mysql:3306/concert_db"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv(
    "JWT_SECRET_KEY",
    "supersecretkey"
)


db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)


with app.app_context():
    db.create_all()
    start_expiration_scheduler(app)

# ============ User APIs ============

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    if not email or not username or not password:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

        new_user = User(
            email=email,
            username=username,
            password_hash=hashed_pw
        )

        db.session.add(new_user)
        db.session.commit()

        # Initialize User Statistics in MongoDB
        user_stats_collection.insert_one({
            "user_id": new_user.id,
            "total_topup_amount": 0,
            "total_spend_amount": 0,
            "total_bookings_count": 0,
            "total_canceled_count": 0,
            "total_refunded_amount": 0
        })

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


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


# ============ Concerts APIs (Public - for users) ============

@app.route("/api/concerts", methods=["GET"])
@jwt_required()
def get_concerts():
    # Only show published concerts (available or ended) to regular users
    events = Event.query.filter(Event.status.in_(["available", "ended"])).all()
    result = []
    for event in events:
        zones = Zone.query.filter_by(event_id=event.id).all()
        zone_list = []
        for z in zones:
            zone_list.append({
                "id": z.id,
                "name": z.name,
                "capacity": z.capacity,
                "price": z.price,
                "is_available": z.is_available
            })
        result.append({
            "id": event.id,
            "name": event.title,
            "description": event.description,
            "date": event.event_datetime.strftime("%d %B %Y"),
            "location": event.location,
            "image": event.image_url or "https://picsum.photos/400/250?random=" + str(event.id),
            "status": event.status,
            "zones": zone_list
        })
    return jsonify(result), 200


@app.route("/api/concerts/<int:concert_id>", methods=["GET"])
@jwt_required()
def get_concert(concert_id):
    event = Event.query.get(concert_id)
    if not event:
        return jsonify({"error": "Concert not found"}), 404
    
    zones = Zone.query.filter_by(event_id=event.id).all()
    zone_list = []
    for z in zones:
        zone_list.append({
            "id": z.id,
            "name": z.name,
            "capacity": z.capacity,
            "price": z.price,
            "is_available": z.is_available
        })
        
    return jsonify({
        "id": event.id,
        "name": event.title,
        "description": event.description,
        "date": event.event_datetime.strftime("%d %B %Y"),
        "location": event.location,
        "image": event.image_url or "https://picsum.photos/400/250?random=" + str(event.id),
        "status": event.status,
        "zones": zone_list
    }), 200


@app.route("/api/concerts/<int:concert_id>/zones", methods=["GET"])
@jwt_required()
def get_zones(concert_id):
    zones = Zone.query.filter_by(event_id=concert_id, is_available=True).all()
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


# ============ Admin Concert Management APIs ============

def admin_required():
    """Check if the current user is an admin. Returns user or error response."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return None, (jsonify({"error": "User not found"}), 404)
    if user.role != "admin":
        return None, (jsonify({"error": "Admin access required"}), 403)
    return user, None


@app.route("/api/admin/concerts", methods=["POST"])
@jwt_required()
def create_concert():
    user, error = admin_required()
    if error:
        return error

    data = request.get_json()
    title = data.get("title")
    description = data.get("description", "")
    location = data.get("location", "")
    event_datetime_str = data.get("event_datetime")
    image_url = data.get("image_url", "")
    zones_data = data.get("zones", [])

    if not title or not event_datetime_str:
        return jsonify({"error": "Title and event_datetime are required"}), 400

    try:
        event_datetime = datetime.strptime(event_datetime_str, "%Y-%m-%dT%H:%M")
    except ValueError:
        return jsonify({"error": "Invalid datetime format. Use YYYY-MM-DDTHH:MM"}), 400

    try:
        new_event = Event(
            title=title,
            description=description,
            location=location,
            event_datetime=event_datetime,
            status="draft",
            image_url=image_url
        )
        db.session.add(new_event)
        db.session.flush()  # Get the event ID before committing

        # Add zones if provided
        for z in zones_data:
            zone = Zone(
                event_id=new_event.id,
                name=z.get("name", "General"),
                capacity=z.get("capacity", 100),
                price=z.get("price", 0)
            )
            db.session.add(zone)

        db.session.commit()
        return jsonify({
            "message": "Concert created as draft",
            "id": new_event.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route("/api/admin/concerts/drafts", methods=["GET"])
@jwt_required()
def get_draft_concerts():
    user, error = admin_required()
    if error:
        return error

    events = Event.query.filter_by(status="draft").order_by(Event.created_at.desc()).all()
    result = []
    for event in events:
        zones = Zone.query.filter_by(event_id=event.id).all()
        zone_list = [{"id": z.id, "name": z.name, "capacity": z.capacity, "price": z.price} for z in zones]
        result.append({
            "id": event.id,
            "name": event.title,
            "description": event.description,
            "date": event.event_datetime.strftime("%d %B %Y"),
            "event_datetime": event.event_datetime.strftime("%Y-%m-%dT%H:%M"),
            "location": event.location,
            "image": event.image_url or "https://picsum.photos/400/250?random=" + str(event.id),
            "status": event.status,
            "zones": zone_list,
            "created_at": event.created_at.isoformat() if event.created_at else None
        })
    return jsonify(result), 200


@app.route("/api/admin/concerts/<int:concert_id>/publish", methods=["PUT"])
@jwt_required()
def publish_concert(concert_id):
    user, error = admin_required()
    if error:
        return error

    event = Event.query.get(concert_id)
    if not event:
        return jsonify({"error": "Concert not found"}), 404

    if event.status != "draft":
        return jsonify({"error": "Only draft concerts can be published"}), 400

    event.status = "available"
    db.session.commit()

    return jsonify({"message": "Concert published successfully"}), 200


@app.route("/api/admin/concerts/<int:concert_id>", methods=["PUT"])
@jwt_required()
def update_concert(concert_id):
    user, error = admin_required()
    if error:
        return error

    event = Event.query.get(concert_id)
    if not event:
        return jsonify({"error": "Concert not found"}), 404

    data = request.get_json()

    if data.get("title"):
        event.title = data["title"]
    if data.get("description") is not None:
        event.description = data["description"]
    if data.get("location"):
        event.location = data["location"]
    if data.get("event_datetime"):
        try:
            event.event_datetime = datetime.strptime(data["event_datetime"], "%Y-%m-%dT%H:%M")
        except ValueError:
            return jsonify({"error": "Invalid datetime format"}), 400
    if data.get("image_url") is not None:
        event.image_url = data["image_url"]

    # Update zones if provided
    if "zones" in data:
        # Delete existing zones
        Zone.query.filter_by(event_id=event.id).delete()
        # Add new zones
        for z in data["zones"]:
            zone = Zone(
                event_id=event.id,
                name=z.get("name", "General"),
                capacity=z.get("capacity", 100),
                price=z.get("price", 0)
            )
            db.session.add(zone)

    db.session.commit()
    return jsonify({"message": "Concert updated successfully"}), 200


@app.route("/api/admin/concerts/<int:concert_id>", methods=["DELETE"])
@jwt_required()
def delete_concert(concert_id):
    user, error = admin_required()
    if error:
        return error

    event = Event.query.get(concert_id)
    if not event:
        return jsonify({"error": "Concert not found"}), 404

    # Only allow deleting drafts
    if event.status != "draft":
        return jsonify({"error": "Only draft concerts can be deleted"}), 400

    # Delete associated zones first
    Zone.query.filter_by(event_id=event.id).delete()
    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Concert deleted successfully"}), 200


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
        db.session.flush()

        # Update Zone Capacity
        zone.capacity -= quantity

        # Log Ticket Transaction
        log_transaction(
            user_id=int(user_id),
            action="ticket",
            details={
                "status": booking_status,
                "booking_id": booking.id,
                "total_price": total_price
            }
        )

        # Log Payment Transaction if paid immediately
        if booking_status == "paid":
            log_transaction(
                user_id=int(user_id),
                action="payment",
                details={
                    "status": "success",
                    "booking_id": booking.id,
                    "amount_paid": total_price,
                    "new_balance": user.tokens
                }
            )

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

        booking.status = "canceled"
        log_transaction(
            user_id=int(user_id),
            action="payment",
            details={
                "status": "cancel_and_refund",
                "booking_id": booking.id,
                "refunded_tokens": payment.total_price,
                "new_balance": user.tokens
            }
        )

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

        log_transaction(
            user_id=int(user_id),
            action="payment",
            details={
                "status": "success",
                "booking_id": booking.id,
                "amount_paid": payment.total_price,
                "new_balance": user.tokens
            }
        )

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

        log_transaction(
            user_id=int(user_id),
            action="topup_token",
            details={
                "amount": amount,
                "payment_method": paymentMethod,
                "new_balance": user.tokens
            }
        )

        return jsonify({
            "message": "Top-up successful",
            "new_balance": user.tokens
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# ============ Transaction History APIs ============

@app.route("/api/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = int(get_jwt_identity())

    transactions = list(
        transactions_collection.find(
            {"user_id": user_id, "is_deleted": False}
        ).sort("created_at", -1)
    )

    for t in transactions:
        t["_id"] = str(t["_id"])
        
        # Query SQL database for additional metadata if booking_id is present
        details = t.get("details") or {}
        booking_id = details.get("booking_id")
        
        if booking_id:
            try:
                booking = Booking.query.get(booking_id)
                if booking:
                    zone = Zone.query.get(booking.zone_id)
                    event = Event.query.get(zone.event_id) if zone else None
                    
                    if event:
                        details["event_name"] = details.get("event_name", event.title)
                    if zone:
                        details["zone_name"] = details.get("zone_name", zone.name)
                    
                    details["quantity"] = details.get("quantity", booking.quantity)
                    
                    # Ensure field name consistency for the frontend
                    if t["action"] == "ticket":
                        details["total_price"] = float(details.get("total_price", 0) or 0)
                    elif t["action"] == "payment":
                        status = details.get("status")
                        if status in ["success", "failed"]:
                            if "amount_paid" not in details or details["amount_paid"] is None:
                                payment = Payment.query.get(booking.payment_id)
                                details["amount_paid"] = float(payment.total_price if payment else 0)
                            else:
                                details["amount_paid"] = float(details["amount_paid"])
                        elif status == "cancel_and_refund":
                            if "refunded_tokens" not in details or details["refunded_tokens"] is None:
                                payment = Payment.query.get(booking.payment_id)
                                details["refunded_tokens"] = float(payment.total_price if payment else 0)
                            else:
                                details["refunded_tokens"] = float(details["refunded_tokens"])
            except Exception as e:
                print(f"Error looking up metadata for transaction {t['_id']}: {str(e)}")
        
        # Final safety defaults for numeric fields to prevent frontend crash
        if t["action"] == "ticket":
            details["total_price"] = float(details.get("total_price", 0) or 0)
        elif t["action"] == "payment":
            details["amount_paid"] = float(details.get("amount_paid", 0) or 0)
            details["refunded_tokens"] = float(details.get("refunded_tokens", 0) or 0)
        elif t["action"] == "topup_token":
            details["amount"] = float(details.get("amount", 0) or 0)

        t["details"] = details

    return jsonify(transactions)


@app.route("/api/user/stats", methods=["GET"])
@jwt_required()
def get_user_stats():
    user_id = int(get_jwt_identity())
    
    stats = user_stats_collection.find_one({"user_id": user_id})
    if not stats:
        stats = {
            "total_topup_amount": 0,
            "total_spend_amount": 0,
            "total_bookings_count": 0,
            "total_canceled_count": 0,
            "total_refunded_amount": 0
        }
    else:
        stats.pop("_id", None)
        defaults = {
            "total_topup_amount": 0,
            "total_spend_amount": 0,
            "total_bookings_count": 0,
            "total_canceled_count": 0,
            "total_refunded_amount": 0
        }
        for k, v in defaults.items():
            if k not in stats:
                stats[k] = v

    return jsonify(stats)


@app.cli.command("recreate-db")
def recreate_db_command():
    """Drops and recreates all database tables."""
    db.drop_all()
    db.create_all()
    print("Database recreated successfully!")


@app.cli.command("delete-user")
@click.argument("identifier")
def delete_user(identifier):
    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user:
        print(f"User with identifier '{identifier}' not found.")
        return

    if user.deleted_at:
        print(f"User '{user.username}' is already soft-deleted.")
        return

    user.deleted_at = datetime.utcnow()
    db.session.commit()
    print(f"User '{user.username}' has been soft-deleted.")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)