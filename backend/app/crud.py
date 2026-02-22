"""
CRUD helpers for the transactions and feedback tables.
"""
import json
from sqlalchemy.orm import Session
from .models import Transaction, UserProfile


def save_transaction(db: Session, **kwargs) -> Transaction:
    """Insert a new transaction record and return it."""
    # Convert shap_reasons list to JSON string for storage
    shap = kwargs.pop("shap_reasons", None)
    record = Transaction(**kwargs)
    if shap:
        record.shap_reasons = json.dumps(shap)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_all_transactions(db: Session) -> list[Transaction]:
    """Return every transaction, newest first."""
    return (
        db.query(Transaction)
        .order_by(Transaction.timestamp.desc())
        .all()
    )


def get_user_profile(db: Session, user_id: str) -> UserProfile | None:
    """Get or None."""
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()


def get_or_create_user(db: Session, user_id: str) -> UserProfile:
    """Find user profile or create a default one."""
    profile = get_user_profile(db, user_id)
    if not profile:
        profile = UserProfile(
            user_id=user_id,
            account_age_days=0,
            trust_score=0.5,
            avg_amount_30d=0.0,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile
