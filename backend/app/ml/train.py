"""
Model training for fraud detection demo.

Generates synthetic data with 3 features (amount, device_type, hour)
and trains a RandomForestClassifier. Saves to fraud_model.pkl.
"""
import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier

from ..config import MODEL_PATH, RANDOM_STATE


DEVICE_MAP = {"Mobile": 0, "Desktop": 1, "Tablet": 2}


def train_and_save_model() -> str:
    """
    Generate synthetic data, train a RandomForestClassifier,
    and save it to MODEL_PATH.

    Returns a status message.
    """
    np.random.seed(RANDOM_STATE)
    n = 5000

    # --- Legitimate transactions (80%) ---
    n_legit = int(n * 0.80)
    legit_amounts = np.random.lognormal(mean=4.0, sigma=1.0, size=n_legit).clip(5, 3000)
    legit_devices = np.random.choice([0, 1, 2], size=n_legit, p=[0.5, 0.35, 0.15])
    legit_hours = np.random.choice(range(8, 22), size=n_legit)  # daytime
    legit_labels = np.zeros(n_legit, dtype=int)

    # --- Fraudulent transactions (20%) ---
    n_fraud = n - n_legit
    fraud_amounts = np.random.lognormal(mean=7.0, sigma=1.2, size=n_fraud).clip(2000, 100000)
    fraud_devices = np.random.choice([0, 1, 2], size=n_fraud, p=[0.6, 0.2, 0.2])
    fraud_hours = np.random.choice(
        list(range(0, 6)) + list(range(22, 24)), size=n_fraud
    )  # late night / early morning
    fraud_labels = np.ones(n_fraud, dtype=int)

    # Combine
    X = np.column_stack([
        np.concatenate([legit_amounts, fraud_amounts]),
        np.concatenate([legit_devices, fraud_devices]),
        np.concatenate([legit_hours, fraud_hours]),
    ])
    y = np.concatenate([legit_labels, fraud_labels])

    # Shuffle
    idx = np.random.permutation(n)
    X, y = X[idx], y[idx]

    # Train
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    model.fit(X, y)

    # Save
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    return f"Model trained on {n} samples and saved to {MODEL_PATH}"
