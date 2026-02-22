"""
SHAP-based Explainability for fraud predictions.

Returns the **top-3 human-readable reasons** for why a transaction
was flagged (or cleared).

Falls back to feature-importance ranking if SHAP is not installed.
"""
from __future__ import annotations

import numpy as np

try:
    import shap
    _SHAP_AVAILABLE = True
except ImportError:
    _SHAP_AVAILABLE = False

# Friendly display names
FEATURE_LABELS = {
    "amount":            "Transaction Amount",
    "device_enc":        "Device Type",
    "hour":              "Time of Day",
    "tx_count_1h":       "Transactions in Last Hour",
    "tx_amount_sum_24h": "Total Amount (24h)",
    "amount_ratio":      "Amount vs 30-Day Avg",
    "velocity_score":    "Transaction Velocity",
    "impossible_travel": "Impossible Travel Flag",
}

FEATURE_NAMES = list(FEATURE_LABELS.keys())


def explain_prediction(
    model,
    feature_values: dict,
    top_n: int = 3,
) -> list[str]:
    """
    Return the top-N human-readable reasons for the model's decision.

    Args:
        model:          Trained classifier (XGBoost / sklearn).
        feature_values: Dict mapping feature name → value.
        top_n:          Number of reasons to return.

    Returns:
        List of strings like:
            "High Transaction Amount ($45,000) pushed risk up by +32%"
    """
    X = np.array([[feature_values.get(f, 0) for f in FEATURE_NAMES]])

    if _SHAP_AVAILABLE:
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X)
            # For binary classifiers shap_values may be a list [neg, pos]
            if isinstance(shap_values, list):
                vals = shap_values[1][0]
            else:
                vals = shap_values[0]
        except Exception:
            vals = _fallback_importance(model)
    else:
        vals = _fallback_importance(model)

    # Build sorted reasons
    indexed = list(enumerate(vals))
    indexed.sort(key=lambda x: abs(x[1]), reverse=True)

    reasons: list[str] = []
    for idx, shap_val in indexed[:top_n]:
        fname = FEATURE_NAMES[idx]
        label = FEATURE_LABELS.get(fname, fname)
        raw = feature_values.get(fname, 0)
        direction = "increased" if shap_val > 0 else "decreased"
        pct = abs(round(shap_val * 100, 1))

        # Human-friendly formatting
        if fname == "amount":
            val_str = f"${raw:,.2f}"
        elif fname == "impossible_travel":
            val_str = "Yes" if raw else "No"
        elif fname == "hour":
            val_str = f"{int(raw)}:00"
        else:
            val_str = f"{raw}"

        reasons.append(f"{label} ({val_str}) {direction} risk by {pct}%")

    return reasons


def _fallback_importance(model) -> np.ndarray:
    """Use model feature importances as a proxy when SHAP is unavailable."""
    if hasattr(model, "feature_importances_"):
        return model.feature_importances_
    return np.zeros(len(FEATURE_NAMES))
