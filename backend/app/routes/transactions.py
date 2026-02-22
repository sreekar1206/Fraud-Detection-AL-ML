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
from ..models import Transaction

# Engine imports
from ..engine.ensemble import predict_risk
from ..engine.features import BehavioralFeatureEngine
from ..engine.threshold import compute_threshold, apply_threshold
from ..engine.explainability import explain_prediction
from ..engine.graph import ContagionGraph
from ..engine.feedback import record_feedback as _record_feedback
from ..engine.champion_challenger import evaluate_and_swap
from ..engine.vpn_detection import detect_vpn
from ..engine.ip_analytics import IPAnalytics
from ..engine.feature_store import FeatureStore

from ..config import MULE_ACCOUNTS

router = APIRouter(tags=["Transactions"])

# Singletons initialised once — module-level to preserve in-memory state
_feature_engine = BehavioralFeatureEngine()
_graph = ContagionGraph(mule_accounts=MULE_ACCOUNTS)
_ip_analytics = IPAnalytics()
_feature_store = FeatureStore()  # singleton: keeps velocity data across requests

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

    # ── 0. VPN Detection & IP Analytics ──
    vpn_result = detect_vpn(ip_address)
    ip_density = _ip_analytics.get_ip_traffic_density(db, ip_address, window_hours=24)

    # ── 1. User context ──
    user = get_or_create_user(db, user_id)

    # ── 2. Behavioural features ──
    recent = _feature_store.get_recent_transactions(user_id, hours=24)
    count_1h, _ = _feature_store.get_velocity(user_id, window_hours=1)

    bf = _feature_engine.compute(
        current_amount=payload.amount,
        recent_transactions=recent,
        avg_amount_30d=user.avg_amount_30d or payload.amount,
    )

    # Record this transaction in the store for future velocity
    _feature_store.record_transaction(user_id, payload.amount, now)

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
        is_vpn=vpn_result["is_vpn"],
        ip_traffic_density=ip_density,
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


@router.get("/api/history")
async def transaction_history(db: Session = Depends(get_db)):
    """Return all transactions sorted newest first, including the DB id for feedback."""
    records = get_all_transactions(db)
    results = []
    for r in records:
        shap = []
        if r.shap_reasons:
            try:
                shap = json.loads(r.shap_reasons)
            except Exception:
                shap = []
        results.append({
            "id": r.id,
            "name": r.name,
            "amount": r.amount,
            "device": r.device,
            "ip_address": r.ip_address,
            "fraud_probability": r.fraud_probability,
            "risk_level": r.risk_level,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "risk_score": r.risk_score,
            "xgb_proba": r.xgb_proba,
            "iso_score": r.iso_score,
            "threshold_used": r.threshold_used,
            "flagged": r.flagged,
            "shap_reasons": shap,
            "graph_flagged": r.graph_flagged,
            "tx_count_1h": r.tx_count_1h,
            "tx_amount_sum_24h": r.tx_amount_sum_24h,
            "impossible_travel": r.impossible_travel,
            "amount_ratio": r.amount_ratio,
            "velocity_score": r.velocity_score,
            "trust_score": r.trust_score,
            "account_age_days": r.account_age_days,
            "is_vpn": r.is_vpn,
        })
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


@router.get("/api/insights/daily")
async def get_daily_insights_endpoint(
    date: str | None = None,
    db: Session = Depends(get_db),
):
    """Get daily risk insights and analytics."""
    from ..engine.daily_insights import get_daily_insights
    from datetime import datetime
    
    target_date = None
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    insights = get_daily_insights(db, target_date)
    return insights


@router.get("/api/insights/weekly")
async def get_weekly_trends_endpoint(
    days: int = 7,
    db: Session = Depends(get_db),
):
    """Get weekly trends for the last N days."""
    from ..engine.daily_insights import get_weekly_trends
    
    if days < 1 or days > 30:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 30")
    
    trends = get_weekly_trends(db, days)
    return trends


@router.get("/api/forensics/{transaction_id}")
async def get_transaction_forensics(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    """Get detailed forensics analysis for a specific transaction."""
    from ..models import Transaction
    
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get IP analytics
    ip_patterns = _ip_analytics.analyze_ip_patterns(db, tx.ip_address)
    
    # Parse SHAP reasons
    shap_reasons = []
    if tx.shap_reasons:
        try:
            shap_reasons = json.loads(tx.shap_reasons)
        except Exception:
            shap_reasons = []
    
    return {
        "transaction_id": tx.id,
        "name": tx.name,
        "amount": tx.amount,
        "device": tx.device,
        "ip_address": tx.ip_address,
        "timestamp": tx.timestamp,
        "risk_score": tx.risk_score,
        "risk_level": tx.risk_level,
        "flagged": tx.flagged,
        "is_vpn": tx.is_vpn,
        "ip_traffic_density": tx.ip_traffic_density,
        "impossible_travel": tx.impossible_travel,
        "tx_count_1h": tx.tx_count_1h,
        "tx_amount_sum_24h": tx.tx_amount_sum_24h,
        "velocity_score": tx.velocity_score,
        "amount_ratio": tx.amount_ratio,
        "xgb_proba": tx.xgb_proba,
        "iso_score": tx.iso_score,
        "threshold_used": tx.threshold_used,
        "shap_reasons": shap_reasons,
        "graph_flagged": tx.graph_flagged,
        "latitude": tx.latitude,
        "longitude": tx.longitude,
        "country_code": tx.country_code,
        "city": tx.city,
        "ip_analytics": ip_patterns,
    }


@router.get("/api/forensics")
async def get_all_forensics(
    limit: int = 100,
    flagged_only: bool = False,
    db: Session = Depends(get_db),
):
    """Get forensics data for all transactions (or flagged only)."""
    query = db.query(Transaction)
    
    if flagged_only:
        query = query.filter(Transaction.flagged == True)
    
    transactions = query.order_by(Transaction.timestamp.desc()).limit(limit).all()
    
    results = []
    for tx in transactions:
        shap_reasons = []
        if tx.shap_reasons:
            try:
                shap_reasons = json.loads(tx.shap_reasons)
            except Exception:
                shap_reasons = []
        
        results.append({
            "transaction_id": tx.id,
            "name": tx.name,
            "amount": tx.amount,
            "ip_address": tx.ip_address,
            "timestamp": tx.timestamp,
            "risk_score": tx.risk_score,
            "risk_level": tx.risk_level,
            "flagged": tx.flagged,
            "is_vpn": tx.is_vpn,
            "impossible_travel": tx.impossible_travel,
            "velocity_score": tx.velocity_score,
            "shap_reasons": shap_reasons,
        })
    
    return results
