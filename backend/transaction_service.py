from datetime import datetime
from mongo import transactions_collection, user_stats_collection

def log_transaction(user_id, action, details):
    transaction = {
        "user_id": user_id,
        "action": action,
        "details": details,
        "created_at": datetime.utcnow(),
        "is_deleted": False
    }

    transactions_collection.insert_one(transaction)

    # Update User Statistics
    update_data = {}
    
    if action == "topup_token":
        update_data["total_topup_amount"] = details.get("amount", 0)
    elif action == "payment":
        status = details.get("status")
        if status == "success":
            update_data["total_spend_amount"] = details.get("amount_paid", 0)
        elif status == "cancel_and_refund":
            update_data["total_refunded_amount"] = details.get("refunded_tokens", 0)
            update_data["total_canceled_count"] = 1
    elif action == "ticket":
        update_data["total_bookings_count"] = 1

    if update_data:
        user_stats_collection.update_one(
            {"user_id": user_id},
            {"$inc": update_data},
            upsert=True
        )