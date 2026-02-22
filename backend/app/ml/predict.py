"""
Fraud prediction module.

Loads the trained model and preprocesses incoming transactions
to produce fraud probability scores.
"""
import os
import numpy as np
import joblib

from ..config import MODEL_PATH
from .preprocessing import preprocess_single_transaction


def predict_fraud(transaction_data: dict) -> dict:
    """
    Predict whether a transaction is fraudulent.

    Args:
        transaction_data: dict with keys: amount, transaction_time, location, device_type, merchant_id

    Returns:
        dict with: fraud_probability, is_fraud, fraud_score, risk_level, model_used
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "No trained model found. Please train the model first via POST /train-model."
        )

    # Load model
    model = joblib.load(MODEL_PATH)
    model_name = type(model).__name__

    # Preprocess input
    X = preprocess_single_transaction(transaction_data)

    # Make prediction
    if hasattr(model, "predict_proba"):
        # Standard classifiers (LR, RF, XGBoost)
        fraud_probability = float(model.predict_proba(X)[0][1])
        is_fraud = bool(model.predict(X)[0])
    else:
        # Isolation Forest: -1 = anomaly = fraud
        raw_pred = model.predict(X)[0]
        anomaly_score = model.decision_function(X)[0]
        # Convert to probability-like score (0 to 1)
        fraud_probability = float(max(0, min(1, 0.5 - anomaly_score)))
        is_fraud = bool(raw_pred == -1)

    # Calculate fraud score (0-100)
    fraud_score = round(fraud_probability * 100, 2)

    # Determine risk level
    if fraud_probability >= 0.8:
        risk_level = "CRITICAL"
    elif fraud_probability >= 0.6:
        risk_level = "HIGH"
    elif fraud_probability >= 0.3:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "fraud_probability": round(fraud_probability, 4),
        "is_fraud": is_fraud,
        "fraud_score": fraud_score,
        "risk_level": risk_level,
        "model_used": model_name,
    }
