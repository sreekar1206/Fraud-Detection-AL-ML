"""
Fraud prediction module.

Loads the trained RandomForest model and predicts fraud probability
for a transaction described by (amount, device, hour).
"""
import numpy as np
import joblib

from ..config import MODEL_PATH


# Device encoding – must match training
DEVICE_MAP = {"Mobile": 0, "Desktop": 1, "Tablet": 2}

# Model loaded once at import time (after training ensures it exists)
_model = None


def _load_model():
    """Lazy-load the model from disk."""
    global _model
    _model = joblib.load(MODEL_PATH)


def predict_fraud(amount: float, device: str, hour: int) -> dict:
    """
    Predict fraud probability for a single transaction.

    Args:
        amount:  Transaction amount in USD.
        device:  Device type string ("Mobile", "Desktop", "Tablet").
        hour:    Hour of the day (0-23).

    Returns:
        dict with fraud_probability (0-100) and risk_level.
    """
    if _model is None:
        _load_model()

    device_enc = DEVICE_MAP.get(device, 0)
    X = np.array([[amount, device_enc, hour]])

    proba = float(_model.predict_proba(X)[0][1])  # P(fraud)
    fraud_pct = round(proba * 100, 2)

    if proba > 0.7:
        risk = "High"
    elif proba > 0.3:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "fraud_probability": fraud_pct,
        "risk_level": risk,
    }
