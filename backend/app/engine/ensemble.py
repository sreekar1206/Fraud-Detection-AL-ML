"""
Hybrid Ensemble Model — XGBoost × IsolationForest.

Combines supervised classification (XGBoost with scale_pos_weight for
class imbalance) with unsupervised anomaly detection (IsolationForest)
into a single **Weighted Risk Score**:

    risk_score = W_XGB * xgb_proba + W_ISO * iso_score

Default weights: 0.70 / 0.30
"""
from __future__ import annotations

import os
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

try:
    import xgboost as xgb
    _XGB_AVAILABLE = True
except ImportError:
    from sklearn.ensemble import GradientBoostingClassifier as _FallbackGBC
    _XGB_AVAILABLE = False

from ..config import ENSEMBLE_DIR, RANDOM_STATE

# Feature names (order matters — must match training)
FEATURE_NAMES = [
    "amount",
    "device_enc",
    "hour",
    "tx_count_1h",
    "tx_amount_sum_24h",
    "amount_ratio",
    "velocity_score",
    "impossible_travel",
]

W_XGB = 0.70
W_ISO = 0.30

_champion_xgb = None
_champion_iso = None


def _paths():
    return (
        os.path.join(ENSEMBLE_DIR, "champion_xgb.pkl"),
        os.path.join(ENSEMBLE_DIR, "champion_iso.pkl"),
    )


# ── Training ────────────────────────────────────────────────

def _generate_training_data(n: int = 8000) -> tuple[np.ndarray, np.ndarray]:
    """Synthetic data with 8 features for the ensemble."""
    np.random.seed(RANDOM_STATE)

    n_legit = int(n * 0.80)
    n_fraud = n - n_legit

    def _block(size, fraud: bool):
        if fraud:
            amount = np.random.lognormal(7.0, 1.3, size).clip(2000, 100_000)
            device = np.random.choice([0, 1, 2], size, p=[0.6, 0.2, 0.2])
            hour = np.random.choice(list(range(0, 6)) + list(range(22, 24)), size)
            tx1h = np.random.poisson(6, size).clip(0, 20)
            txsum24 = np.random.lognormal(9, 1.0, size).clip(5000, 500_000)
            ratio = np.random.lognormal(1.5, 0.8, size).clip(1, 50)
            vel = np.random.uniform(0.5, 1.0, size)
            travel = np.random.choice([0, 1], size, p=[0.4, 0.6])
        else:
            amount = np.random.lognormal(4.0, 1.0, size).clip(5, 3000)
            device = np.random.choice([0, 1, 2], size, p=[0.5, 0.35, 0.15])
            hour = np.random.choice(range(8, 22), size)
            tx1h = np.random.poisson(1, size).clip(0, 5)
            txsum24 = np.random.lognormal(6, 0.8, size).clip(10, 10_000)
            ratio = np.random.uniform(0.5, 2.0, size)
            vel = np.random.uniform(0.0, 0.3, size)
            travel = np.random.choice([0, 1], size, p=[0.95, 0.05])

        return np.column_stack([amount, device, hour, tx1h, txsum24, ratio, vel, travel])

    X_legit = _block(n_legit, False)
    X_fraud = _block(n_fraud, True)
    X = np.vstack([X_legit, X_fraud])
    y = np.concatenate([np.zeros(n_legit), np.ones(n_fraud)])
    idx = np.random.permutation(len(y))
    return X[idx], y[idx]


def train_ensemble() -> str:
    """Train XGBoost + IsolationForest and save as champion models."""
    global _champion_xgb, _champion_iso

    X, y = _generate_training_data()
    os.makedirs(ENSEMBLE_DIR, exist_ok=True)

    # ── XGBoost (supervised) ──
    fraud_ratio = (y == 0).sum() / max((y == 1).sum(), 1)
    if _XGB_AVAILABLE:
        clf = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            scale_pos_weight=fraud_ratio,
            random_state=RANDOM_STATE,
            eval_metric="logloss",
            n_jobs=-1,
        )
    else:
        clf = _FallbackGBC(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            random_state=RANDOM_STATE,
        )
    clf.fit(X, y)

    # ── IsolationForest (unsupervised) ──
    iso = IsolationForest(
        n_estimators=200,
        contamination=0.20,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    iso.fit(X)

    xgb_path, iso_path = _paths()
    joblib.dump(clf, xgb_path)
    joblib.dump(iso, iso_path)

    _champion_xgb = clf
    _champion_iso = iso

    return f"Ensemble trained on {len(y)} samples — XGBoost + IsolationForest saved"


# ── Prediction ──────────────────────────────────────────────

def _load():
    global _champion_xgb, _champion_iso
    xgb_path, iso_path = _paths()
    if os.path.exists(xgb_path) and os.path.exists(iso_path):
        _champion_xgb = joblib.load(xgb_path)
        _champion_iso = joblib.load(iso_path)
        return True
    return False


def predict_risk(features: dict) -> dict:
    """
    Predict combined risk score for a single transaction.

    ``features`` must contain keys matching FEATURE_NAMES.

    Returns dict with:
        xgb_proba, iso_score, risk_score (0-100), risk_level
    """
    global _champion_xgb, _champion_iso

    if _champion_xgb is None:
        if not _load():
            raise FileNotFoundError("Ensemble models not trained yet.")

    X = np.array([[features.get(f, 0) for f in FEATURE_NAMES]])

    # XGBoost probability
    xgb_proba = float(_champion_xgb.predict_proba(X)[0][1])

    # IsolationForest anomaly score  →  normalised to 0-1
    raw_iso = _champion_iso.decision_function(X)[0]
    iso_score = float(max(0.0, min(1.0, 0.5 - raw_iso)))

    # Weighted combination
    risk = W_XGB * xgb_proba + W_ISO * iso_score
    risk_pct = round(risk * 100, 2)

    if risk > 0.7:
        level = "High"
    elif risk > 0.3:
        level = "Medium"
    else:
        level = "Low"

    return {
        "xgb_proba": round(xgb_proba, 4),
        "iso_score": round(iso_score, 4),
        "risk_score": risk_pct,
        "risk_level": level,
    }
