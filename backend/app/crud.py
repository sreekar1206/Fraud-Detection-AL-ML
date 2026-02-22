"""
CRUD helpers for the transactions and feedback tables.
"""
import json
from sqlalchemy.orm import Session
from .models import Transaction, UserProfile


def save_transaction(db: Session, **kwargs) -> Transaction:
    """Insert a new transaction record, update user profile stats, and return it."""
    shap = kwargs.pop("shap_reasons", None)
    record = Transaction(**kwargs)
    if shap:
        record.shap_reasons = json.dumps(shap)
    db.add(record)
    db.commit()
    db.refresh(record)

    # Update user profile stats after each transaction
    user_id = kwargs.get("user_id")
    amount = kwargs.get("amount", 0.0)
    if user_id:
        _update_user_profile(db, user_id, amount)

    return record


def _update_user_profile(db: Session, user_id: str, new_amount: float) -> None:
    """Update rolling avg_amount_30d and total_transactions for a user."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return
    total = profile.total_transactions or 0
    avg = profile.avg_amount_30d or 0.0
    # Running average
    new_total = total + 1
    new_avg = (avg * total + new_amount) / new_total
    profile.total_transactions = new_total
    profile.avg_amount_30d = round(new_avg, 2)
    db.commit()


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
            total_transactions=0,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile
