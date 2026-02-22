"""
Application configuration.
"""
import os

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fraud_detection.db")

# CORS
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# Simple model (retained for backwards-compat fast path)
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "ml", "fraud_model.pkl"
)

# Ensemble models directory
ENSEMBLE_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "engine", "models"
)

# Redis (optional — set REDIS_URL env var to enable)
REDIS_URL = os.getenv("REDIS_URL", None)   # e.g. "redis://localhost:6379/0"

# Training
RANDOM_STATE = 42

# Known mule accounts (demo — in production, load from DB)
MULE_ACCOUNTS = [
    "mule_001", "mule_002", "mule_003",
    "suspicious_acct_44", "flagged_network_7",
]
