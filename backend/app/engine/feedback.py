"""
Admin Feedback Loop.

When a human analyst confirms or denies fraud on a transaction,
that label is recorded and can trigger an incremental model update.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from ..models import FeedbackLog, Transaction


def record_feedback(
    db: Session,
    transaction_id: int,
    is_fraud_confirmed: bool,
    admin_id: str = "admin",
) -> dict:
    """
    Record an analyst's fraud confirmation for a given transaction.

    Returns acknowledgement dict.
    """
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        return {"status": "error", "message": f"Transaction {transaction_id} not found"}

    entry = FeedbackLog(
        transaction_id=transaction_id,
        confirmed_fraud=is_fraud_confirmed,
        admin_id=admin_id,
    )
    db.add(entry)
    db.commit()

    return {
        "status": "recorded",
        "transaction_id": transaction_id,
        "confirmed_fraud": is_fraud_confirmed,
    }


def get_labelled_data(db: Session) -> list[dict]:
    """
    Fetch all transactions that have admin-confirmed labels.

    Returns list of dicts ready for model retraining.
    """
    feedback_entries = db.query(FeedbackLog).all()
    labelled = []
    for fb in feedback_entries:
        tx = db.query(Transaction).filter(Transaction.id == fb.transaction_id).first()
        if tx:
            labelled.append({
                "amount": tx.amount,
                "device": tx.device,
                "risk_score": tx.risk_score or 0.0,
                "confirmed_fraud": fb.confirmed_fraud,
                "timestamp": tx.timestamp,
            })
    return labelled
