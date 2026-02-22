"""
Application configuration settings.
"""
import os

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fraud_detection.db")

# API Security
API_KEY = os.getenv("API_KEY", "fraudshield-dev-key-2024")

# CORS - allowed origins for frontend
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# ML Model
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "scaler.pkl")
ENCODERS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "encoders.pkl")

# Training parameters
TEST_SIZE = 0.2
RANDOM_STATE = 42
N_SAMPLES = 10000  # Synthetic dataset size for demo
