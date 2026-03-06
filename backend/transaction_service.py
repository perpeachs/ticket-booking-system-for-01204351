from datetime import datetime
from mongo import transactions_collection

def log_transaction(user_id, action, details):

    transaction = {
        "user_id": user_id,
        "action": action,
        "details": details,
        "created_at": datetime.utcnow(),
        "is_deleted": False
    }

    transactions_collection.insert_one(transaction)