"""
Data preprocessing and synthetic data generation for the fraud detection ML pipeline.

Handles:
- Feature encoding (categorical → numeric)
- Feature scaling (StandardScaler)
- Synthetic training data generation for demo purposes
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

from ..config import SCALER_PATH, ENCODERS_PATH, N_SAMPLES, RANDOM_STATE


# Categorical columns and their possible values
CATEGORICAL_COLS = ["location", "device_type", "merchant_id"]
NUMERIC_COLS = ["amount", "transaction_time"]
FEATURE_COLS = NUMERIC_COLS + CATEGORICAL_COLS

# Known categories for encoding
KNOWN_LOCATIONS = [
    "Hyderabad", "Mumbai", "Delhi", "Chennai", "Bangalore",
    "Kolkata", "Pune", "Jaipur", "New York", "London",
    "Singapore", "Dubai", "Tokyo", "Unknown"
]

KNOWN_DEVICES = ["Mobile", "Desktop", "Tablet", "POS", "ATM", "Unknown"]

KNOWN_MERCHANTS = [f"M{i}" for i in range(1, 201)] + ["Unknown"]


def generate_synthetic_data(n_samples: int = N_SAMPLES) -> pd.DataFrame:
    """
    Generate realistic synthetic transaction data for model training.
    Creates a dataset with ~15% fraud rate to simulate real-world imbalance.
    """
    np.random.seed(RANDOM_STATE)

    # Normal transactions (85%)
    n_normal = int(n_samples * 0.85)
    normal_data = {
        "amount": np.random.lognormal(mean=4.5, sigma=1.2, size=n_normal).clip(1, 5000),
        "transaction_time": np.random.uniform(0, 86400, n_normal),
        "location": np.random.choice(KNOWN_LOCATIONS[:10], n_normal),
        "device_type": np.random.choice(KNOWN_DEVICES[:4], n_normal, p=[0.4, 0.35, 0.15, 0.1]),
        "merchant_id": np.random.choice(KNOWN_MERCHANTS[:100], n_normal),
        "is_fraud": np.zeros(n_normal, dtype=int),
    }

    # Fraudulent transactions (15%)
    n_fraud = n_samples - n_normal
    fraud_data = {
        "amount": np.random.lognormal(mean=6.5, sigma=1.5, size=n_fraud).clip(500, 50000),
        "transaction_time": np.random.choice(
            np.concatenate([np.random.uniform(0, 14400, n_fraud // 2),
                            np.random.uniform(72000, 86400, n_fraud // 2)]),
            n_fraud
        ),
        "location": np.random.choice(KNOWN_LOCATIONS, n_fraud),
        "device_type": np.random.choice(KNOWN_DEVICES[:4], n_fraud, p=[0.5, 0.2, 0.1, 0.2]),
        "merchant_id": np.random.choice(KNOWN_MERCHANTS[:200], n_fraud),
        "is_fraud": np.ones(n_fraud, dtype=int),
    }

    # Combine and shuffle
    df = pd.concat([pd.DataFrame(normal_data), pd.DataFrame(fraud_data)], ignore_index=True)
    df = df.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)

    return df


def fit_encoders(df: pd.DataFrame) -> dict:
    """
    Fit label encoders and scaler on training data and save them.
    Returns dict of fitted encoders.
    """
    encoders = {}

    # Fit label encoders for categorical columns
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        # Fit on all known categories + training data
        all_values = list(df[col].unique())
        if col == "location":
            all_values = list(set(all_values + KNOWN_LOCATIONS))
        elif col == "device_type":
            all_values = list(set(all_values + KNOWN_DEVICES))
        elif col == "merchant_id":
            all_values = list(set(all_values + KNOWN_MERCHANTS))
        le.fit(all_values)
        encoders[col] = le

    # Fit scaler on numeric features
    scaler = StandardScaler()
    scaler.fit(df[NUMERIC_COLS])

    # Save encoders and scaler
    os.makedirs(os.path.dirname(ENCODERS_PATH), exist_ok=True)
    joblib.dump(encoders, ENCODERS_PATH)
    joblib.dump(scaler, SCALER_PATH)

    return encoders, scaler


def preprocess_dataframe(df: pd.DataFrame, encoders: dict, scaler: StandardScaler) -> np.ndarray:
    """
    Transform a DataFrame using pre-fitted encoders and scaler.
    Returns a numpy array ready for ML model consumption.
    """
    df_processed = df.copy()

    # Encode categorical columns
    for col in CATEGORICAL_COLS:
        le = encoders[col]
        # Handle unseen labels by mapping to 'Unknown'
        df_processed[col] = df_processed[col].apply(
            lambda x: x if x in le.classes_ else "Unknown"
        )
        df_processed[col] = le.transform(df_processed[col])

    # Scale numeric columns
    df_processed[NUMERIC_COLS] = scaler.transform(df_processed[NUMERIC_COLS])

    feature_cols = NUMERIC_COLS + CATEGORICAL_COLS
    return df_processed[feature_cols].values


def preprocess_single_transaction(transaction_data: dict) -> np.ndarray:
    """
    Preprocess a single transaction dict for prediction.
    Loads saved encoders and scaler, then transforms.
    """
    # Check if encoders and scaler exist
    if not os.path.exists(ENCODERS_PATH) or not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(
            "Preprocessing files (encoders/scaler) not found. "
            "Please train the model first via POST /train-model."
        )
    
    # Load saved encoders and scaler
    encoders = joblib.load(ENCODERS_PATH)
    scaler = joblib.load(SCALER_PATH)

    # Build DataFrame from the single transaction
    df = pd.DataFrame([{
        "amount": transaction_data["amount"],
        "transaction_time": transaction_data["transaction_time"],
        "location": transaction_data["location"],
        "device_type": transaction_data["device_type"],
        "merchant_id": transaction_data["merchant_id"],
    }])

    return preprocess_dataframe(df, encoders, scaler)
