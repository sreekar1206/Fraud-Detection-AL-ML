"""
Model training pipeline for fraud detection.

Trains and compares 4 ML models:
- Logistic Regression
- Random Forest
- XGBoost
- Isolation Forest

Applies SMOTE for handling class imbalance, evaluates all models,
and saves the best-performing one as model.pkl.
"""
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score
)
from imblearn.over_sampling import SMOTE
import xgboost as xgb

from ..config import MODEL_PATH, TEST_SIZE, RANDOM_STATE
from .preprocessing import generate_synthetic_data, fit_encoders, preprocess_dataframe


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray = None) -> dict:
    """Compute classification metrics for a model."""
    metrics = {
        "accuracy": round(accuracy_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_true, y_pred, zero_division=0), 4),
        "f1_score": round(f1_score(y_true, y_pred, zero_division=0), 4),
    }
    if y_prob is not None:
        try:
            metrics["roc_auc"] = round(roc_auc_score(y_true, y_prob), 4)
        except ValueError:
            metrics["roc_auc"] = 0.0
    return metrics


def train_models() -> dict:
    """
    Complete training pipeline:
    1. Generate synthetic data
    2. Preprocess features
    3. Apply SMOTE
    4. Train 4 models
    5. Compare metrics
    6. Save best model

    Returns training results with metrics for all models.
    """
    # Step 1: Generate synthetic data
    print("[TRAIN] Generating synthetic dataset...")
    df = generate_synthetic_data()
    n_samples = len(df)

    # Step 2: Fit encoders and preprocess
    print("[TRAIN] Fitting encoders and preprocessing...")
    encoders, scaler = fit_encoders(df)
    X = preprocess_dataframe(df, encoders, scaler)
    y = df["is_fraud"].values

    # Step 3: Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    # Step 4: Apply SMOTE to training data only
    print("[TRAIN] Applying SMOTE for class balance...")
    smote = SMOTE(random_state=RANDOM_STATE)
    X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
    print(f"[TRAIN] Training set: {len(X_train)} → {len(X_train_bal)} (after SMOTE)")

    # Step 5: Define and train models
    models = {
        "LogisticRegression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            scale_pos_weight=5,
            random_state=RANDOM_STATE,
            eval_metric="logloss",
            use_label_encoder=False,
        ),
    }

    all_metrics = {}
    best_model_name = None
    best_f1 = -1
    best_model = None

    for name, model in models.items():
        print(f"[TRAIN] Training {name}...")
        model.fit(X_train_bal, y_train_bal)

        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else None

        metrics = compute_metrics(y_test, y_pred, y_prob)
        all_metrics[name] = metrics

        print(f"[TRAIN] {name} → F1: {metrics['f1_score']}, AUC: {metrics.get('roc_auc', 'N/A')}")

        if metrics["f1_score"] > best_f1:
            best_f1 = metrics["f1_score"]
            best_model_name = name
            best_model = model

    # Train Isolation Forest separately (unsupervised anomaly detector)
    print("[TRAIN] Training IsolationForest (anomaly detection)...")
    iso_forest = IsolationForest(
        n_estimators=200,
        contamination=0.15,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    iso_forest.fit(X_train)
    iso_pred = iso_forest.predict(X_test)
    iso_pred_binary = np.where(iso_pred == -1, 1, 0)  # -1 = anomaly = fraud

    iso_metrics = compute_metrics(y_test, iso_pred_binary)
    all_metrics["IsolationForest"] = iso_metrics
    print(f"[TRAIN] IsolationForest → F1: {iso_metrics['f1_score']}")

    if iso_metrics["f1_score"] > best_f1:
        best_f1 = iso_metrics["f1_score"]
        best_model_name = "IsolationForest"
        best_model = iso_forest

    # Step 6: Save best model
    print(f"\n[TRAIN] Best model: {best_model_name} (F1: {best_f1})")
    joblib.dump(best_model, MODEL_PATH)
    print(f"[TRAIN] Model saved to {MODEL_PATH}")

    return {
        "status": "success",
        "best_model": best_model_name,
        "metrics": all_metrics[best_model_name],
        "all_models_metrics": all_metrics,
        "training_samples": n_samples,
        "message": f"Training complete. Best model: {best_model_name} with F1 score: {best_f1}",
    }
