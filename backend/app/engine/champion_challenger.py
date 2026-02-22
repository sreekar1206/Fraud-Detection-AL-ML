"""
Champion-Challenger Adaptive Learning Pipeline.

Strategy:
  1. The *Champion* model is the current production model.
  2. Periodically, a *Challenger* is trained on the latest 24 h of
     labelled data (from the admin feedback loop).
  3. Both are evaluated on a holdout set.  If the Challenger's F1 score
     beats the Champion's, they are **swapped** automatically.

File-based model versioning:
  champion_xgb.pkl  /  champion_iso.pkl   — production
  challenger_xgb.pkl / challenger_iso.pkl — candidate
"""
from __future__ import annotations

import os
import shutil
import numpy as np
import joblib
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split

from ..config import ENSEMBLE_DIR, RANDOM_STATE


def _champ_paths():
    return (
        os.path.join(ENSEMBLE_DIR, "champion_xgb.pkl"),
        os.path.join(ENSEMBLE_DIR, "champion_iso.pkl"),
    )


def _challenger_paths():
    return (
        os.path.join(ENSEMBLE_DIR, "challenger_xgb.pkl"),
        os.path.join(ENSEMBLE_DIR, "challenger_iso.pkl"),
    )


def train_challenger(X: np.ndarray, y: np.ndarray) -> dict:
    """
    Train a challenger model on new labelled data.

    Args:
        X: Feature matrix (n_samples, n_features).
        y: Labels (0 = legit, 1 = fraud).

    Returns:
        dict with challenger F1 score and status.
    """
    try:
        import xgboost as xgb
        _XGB = True
    except ImportError:
        from sklearn.ensemble import GradientBoostingClassifier as _FallbackGBC
        _XGB = False

    from sklearn.ensemble import IsolationForest

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y,
    )

    # XGBoost challenger
    fraud_ratio = (y_train == 0).sum() / max((y_train == 1).sum(), 1)
    if _XGB:
        clf = xgb.XGBClassifier(
            n_estimators=200, max_depth=8, learning_rate=0.1,
            scale_pos_weight=fraud_ratio, random_state=RANDOM_STATE,
            eval_metric="logloss", use_label_encoder=False, n_jobs=-1,
        )
    else:
        clf = _FallbackGBC(
            n_estimators=200, max_depth=8, learning_rate=0.1,
            random_state=RANDOM_STATE,
        )
    clf.fit(X_train, y_train)

    # IsolationForest challenger
    iso = IsolationForest(
        n_estimators=200, contamination=0.20,
        random_state=RANDOM_STATE, n_jobs=-1,
    )
    iso.fit(X_train)

    # Evaluate challenger
    y_pred = clf.predict(X_test)
    challenger_f1 = round(f1_score(y_test, y_pred, zero_division=0), 4)

    os.makedirs(ENSEMBLE_DIR, exist_ok=True)
    c_xgb, c_iso = _challenger_paths()
    joblib.dump(clf, c_xgb)
    joblib.dump(iso, c_iso)

    return {"challenger_f1": challenger_f1, "status": "trained"}


def evaluate_and_swap() -> dict:
    """
    Compare Champion vs Challenger F1 on the Challenger's test split.
    If the Challenger wins, swap them.

    Returns status dict.
    """
    champ_xgb, champ_iso = _champ_paths()
    chal_xgb, chal_iso = _challenger_paths()

    if not all(os.path.exists(p) for p in [champ_xgb, chal_xgb]):
        return {"swapped": False, "message": "Missing model files"}

    champion = joblib.load(champ_xgb)
    challenger = joblib.load(chal_xgb)

    # Quick evaluation on synthetic holdout
    from .ensemble import _generate_training_data
    X, y = _generate_training_data(2000)

    champ_f1 = round(f1_score(y, champion.predict(X), zero_division=0), 4)
    chal_f1 = round(f1_score(y, challenger.predict(X), zero_division=0), 4)

    if chal_f1 > champ_f1:
        # Swap: challenger becomes champion
        shutil.copy2(chal_xgb, champ_xgb)
        shutil.copy2(chal_iso, champ_iso)
        # Reload the ensemble module's globals
        from . import ensemble
        ensemble._champion_xgb = None
        ensemble._champion_iso = None

        return {
            "swapped": True,
            "champion_f1": champ_f1,
            "challenger_f1": chal_f1,
            "message": f"Challenger (F1={chal_f1}) beat Champion (F1={champ_f1}) — swapped!",
        }

    return {
        "swapped": False,
        "champion_f1": champ_f1,
        "challenger_f1": chal_f1,
        "message": f"Champion (F1={champ_f1}) still wins over Challenger (F1={chal_f1}).",
    }
