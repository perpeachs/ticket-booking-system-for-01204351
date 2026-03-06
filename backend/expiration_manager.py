from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from extensions import db
from models import Event, Zone, Booking, Payment
from transaction_service import log_transaction

def expire_events():
    now = datetime.utcnow() + timedelta(days=1)
    expired_events = Event.query.filter(
        Event.event_datetime < now,
        Event.status != "completed"
    ).all()
    
    for event in expired_events:
        event.status = "completed"
        event.expired_at = now
        for zone in event.zones:
            zone.is_available = False
            for booking in zone.bookings:
                if booking.status == "pending":
                    booking.status = "expired"
                    # Log ticket expiration
                    log_transaction(
                        user_id=int(booking.user_id),
                        action="ticket",
                        details={
                            "status": "expired",
                            "booking_id": booking.id,
                            "total_price": float(Payment.query.get(booking.payment_id).total_price)
                        }
                    )
            
    if expired_events:
        db.session.commit()
        print(f"[{datetime.now()}] Expired {len(expired_events)} events.")

def expire_bookings():
    now = datetime.utcnow()
    timeout = now - timedelta(minutes=15)
    
    expired_bookings = Booking.query.filter(
        Booking.status == "pending",
        Booking.created_at < timeout
    ).all()
    
    for booking in expired_bookings:
        booking.status = "canceled"
        
        zone = Zone.query.get(booking.zone_id)
        if zone:
            zone.capacity += booking.quantity
            
        if booking.payment_id:
            payment = Payment.query.get(booking.payment_id)
            if payment and payment.status == "pending":
                payment.status = "failed"
                
                # Log transaction for expiration
                log_transaction(
                    user_id=int(booking.user_id),
                    action="payment",
                    details={
                        "status": "failed",
                        "reason": "Payment timeout (15 mins)",
                        "booking_id": booking.id,
                        "amount_paid": float(payment.total_price),
                    }
                )
    if expired_bookings:
        db.session.commit()
        print(f"[{datetime.now()}] Expired {len(expired_bookings)} bookings.")

def start_expiration_scheduler(app):
    scheduler = BackgroundScheduler()
    
    def run_expire_bookings():
        with app.app_context():
            expire_bookings()

    def run_expire_events():
        with app.app_context():
            expire_events()

    scheduler.add_job(run_expire_bookings, 'interval', minutes=1)
    scheduler.add_job(run_expire_events, 'cron', hour=0, minute=0)
    
    scheduler.start()
    return scheduler
