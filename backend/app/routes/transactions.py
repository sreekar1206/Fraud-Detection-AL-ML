"""
Transaction API routes — full advanced engine pipeline.

POST /api/transaction   – analyse via ensemble + behavioural + graph
GET  /api/history       – all records newest first
POST /api/feedback      – admin confirms / denies fraud
POST /api/retrain       – trigger champion-challenger swap
"""
from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    TransactionRequest, TransactionOut,
    FeedbackRequest, FeedbackOut,
    RetrainOut,
)
from ..crud import save_transaction, get_all_transactions, get_or_create_user

# Engine imports
from ..engine.ensemble import predict_risk
from ..engine.features import BehavioralFeatureEngine
from ..engine.threshold import compute_threshold, apply_threshold
from ..engine.explainability import explain_prediction
from ..engine.graph import ContagionGraph
from ..engine.feedback import record_feedback as _record_feedback
from ..engine.champion_challenger import evaluate_and_swap

from ..config import MULE_ACCOUNTS

router = APIRouter(tags=["Transactions"])

# Singletons initialised once
_feature_engine = BehavioralFeatureEngine()
_graph = ContagionGraph(mule_accounts=MULE_ACCOUNTS)

# Device encoding (same as ensemble training)
DEVICE_MAP = {"Mobile": 0, "Desktop": 1, "Tablet": 2}


@router.post("/api/transaction", response_model=TransactionOut)
async def create_transaction(
    payload: TransactionRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Full advanced fraud analysis pipeline."""
    ip_address = request.client.host if request.client else "127.0.0.1"
    now = datetime.utcnow()
    current_hour = now.hour
    user_id = payload.user_id or payload.name.lower().replace(" ", "_")

    # ── 1. User context ──
    user = get_or_create_user(db, user_id)

    # ── 2. Behavioural features ──
    from ..engine.feature_store import FeatureStore
    store = FeatureStore()                      # in-memory (no Redis by default)
    recent = store.get_recent_transactions(user_id, hours=24)
    count_1h, _ = store.get_velocity(user_id, window_hours=1)

    bf = _feature_engine.compute(
        current_amount=payload.amount,
        recent_transactions=recent,
        avg_amount_30d=user.avg_amount_30d or payload.amount,
    )

    # Record this transaction in the store for future velocity
    store.record_transaction(user_id, payload.amount, now)

    # ── 3. Ensemble prediction ──
    device_enc = DEVICE_MAP.get(payload.device, 0)
    features = {
        "amount": payload.amount,
        "device_enc": device_enc,
        "hour": current_hour,
        "tx_count_1h": bf.tx_count_1h,
        "tx_amount_sum_24h": bf.tx_amount_sum_24h,
        "amount_ratio": bf.amount_ratio,
        "velocity_score": bf.velocity_score,
        "impossible_travel": int(bf.impossible_travel),
    }

    try:
        risk = predict_risk(features)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Ensemble models not trained yet")

    # ── 4. Dynamic threshold ──
    threshold = compute_threshold(user.account_age_days, user.trust_score)
    decision = apply_threshold(risk["risk_score"], threshold)

    # ── 5. Explainability (SHAP / feature importance) ──
    try:
        from ..engine.ensemble import _champion_xgb
        shap_reasons = explain_prediction(_champion_xgb, features, top_n=3)
    except Exception:
        shap_reasons = []

    # ── 6. Graph contagion ──
    graph_result = _graph.is_near_mule(user_id, max_hops=2)

    # ── 7. Persist ──
    record = save_transaction(
        db,
        name=payload.name,
        amount=payload.amount,
        device=payload.device,
        ip_address=ip_address,
        fraud_probability=risk["risk_score"],
        risk_level=risk["risk_level"],
        risk_score=risk["risk_score"],
        xgb_proba=risk["xgb_proba"],
        iso_score=risk["iso_score"],
        threshold_used=threshold,
        flagged=decision["flagged"],
        shap_reasons=shap_reasons,
        graph_flagged=graph_result["flagged"],
        tx_count_1h=bf.tx_count_1h,
        tx_amount_sum_24h=bf.tx_amount_sum_24h,
        impossible_travel=bf.impossible_travel,
        amount_ratio=bf.amount_ratio,
        velocity_score=bf.velocity_score,
        user_id=user_id,
        account_age_days=user.account_age_days,
        trust_score=user.trust_score,
    )

    return TransactionOut(
        name=record.name,
        amount=record.amount,
        ip_address=record.ip_address,
        fraud_probability=risk["risk_score"],
        risk_level=risk["risk_level"],
        timestamp=record.timestamp,
        risk_score=risk["risk_score"],
        xgb_proba=risk["xgb_proba"],
        iso_score=risk["iso_score"],
        threshold_used=threshold,
        flagged=decision["flagged"],
        shap_reasons=shap_reasons,
        graph_flagged=graph_result["flagged"],
        tx_count_1h=bf.tx_count_1h,
        tx_amount_sum_24h=bf.tx_amount_sum_24h,
        impossible_travel=bf.impossible_travel,
        amount_ratio=bf.amount_ratio,
        velocity_score=bf.velocity_score,
        trust_score=user.trust_score,
        account_age_days=user.account_age_days,
    )


@router.get("/api/history", response_model=list[TransactionOut])
async def transaction_history(db: Session = Depends(get_db)):
    """Return all transactions sorted newest first."""
    records = get_all_transactions(db)
    results = []
    for r in records:
        shap = []
        if r.shap_reasons:
            try:
                shap = json.loads(r.shap_reasons)
            except Exception:
                shap = []
        results.append(TransactionOut(
            name=r.name,
            amount=r.amount,
            ip_address=r.ip_address,
            fraud_probability=r.fraud_probability,
            risk_level=r.risk_level,
            timestamp=r.timestamp,
            risk_score=r.risk_score,
            xgb_proba=r.xgb_proba,
            iso_score=r.iso_score,
            threshold_used=r.threshold_used,
            flagged=r.flagged,
            shap_reasons=shap,
            graph_flagged=r.graph_flagged,
            tx_count_1h=r.tx_count_1h,
            tx_amount_sum_24h=r.tx_amount_sum_24h,
            impossible_travel=r.impossible_travel,
            amount_ratio=r.amount_ratio,
            velocity_score=r.velocity_score,
            trust_score=r.trust_score,
            account_age_days=r.account_age_days,
        ))
    return results


@router.post("/api/feedback", response_model=FeedbackOut)
async def submit_feedback(
    payload: FeedbackRequest,
    db: Session = Depends(get_db),
):
    """Admin confirms or denies fraud on a transaction."""
    result = _record_feedback(
        db,
        transaction_id=payload.transaction_id,
        is_fraud_confirmed=payload.is_fraud,
        admin_id=payload.admin_id,
    )
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return FeedbackOut(**result)


@router.post("/api/retrain", response_model=RetrainOut)
async def retrain_model():
    """Trigger champion-challenger evaluation and potential swap."""
    try:
        result = evaluate_and_swap()
        return RetrainOut(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
