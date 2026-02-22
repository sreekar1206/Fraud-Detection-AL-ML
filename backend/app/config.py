"""
Application configuration settings.
"""
import os

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fraud_detection.db")

# CORS – allowed origins for frontend
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# ML model
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "ml", "fraud_model.pkl"
)

# Training
RANDOM_STATE = 42
