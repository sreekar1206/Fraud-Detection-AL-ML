"""
CRUD operations for the transactions database.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from .models import Transaction
from .schemas import TransactionCreate


def create_transaction(db: Session, transaction: TransactionCreate, prediction: dict = None) -> Transaction:
    """Create a new transaction record with optional prediction results."""
    db_transaction = Transaction(
        amount=transaction.amount,
        transaction_time=transaction.transaction_time,
        location=transaction.location,
        device_type=transaction.device_type,
        merchant_id=transaction.merchant_id,
    )

    if prediction:
        db_transaction.fraud_probability = prediction.get("fraud_probability")
        db_transaction.is_fraud = prediction.get("is_fraud")
        db_transaction.fraud_score = prediction.get("fraud_score")
        db_transaction.model_used = prediction.get("model_used")

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve a list of transactions with pagination."""
    return db.query(Transaction).order_by(
        Transaction.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_transaction_by_id(db: Session, transaction_id: int):
    """Retrieve a single transaction by ID."""
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()


def get_stats(db: Session) -> dict:
    """Calculate fraud detection statistics from all stored transactions."""
    total = db.query(func.count(Transaction.id)).scalar() or 0
    total_fraud = db.query(func.count(Transaction.id)).filter(
        Transaction.is_fraud == True
    ).scalar() or 0
    total_legit = total - total_fraud

    avg_prob = db.query(func.avg(Transaction.fraud_probability)).scalar() or 0.0
    high_risk = db.query(func.count(Transaction.id)).filter(
        Transaction.fraud_probability >= 0.7
    ).scalar() or 0

    fraud_rate = (total_fraud / total * 100) if total > 0 else 0.0

    return {
        "total_transactions": total,
        "total_fraud": total_fraud,
        "total_legitimate": total_legit,
        "fraud_rate": round(fraud_rate, 2),
        "average_fraud_probability": round(float(avg_prob), 4),
        "high_risk_transactions": high_risk,
    }
