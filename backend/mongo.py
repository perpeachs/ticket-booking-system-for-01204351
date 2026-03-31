from pymongo import MongoClient
from urllib.parse import urlparse
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/concert_db")

client = MongoClient(MONGO_URI)
parsed = urlparse(MONGO_URI)
db_name = parsed.path.lstrip("/") or "concert_db"
db = client[db_name]

transactions_collection = db["transactions"]
user_stats_collection = db["user_stats"]