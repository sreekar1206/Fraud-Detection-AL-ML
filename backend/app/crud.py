"""
CRUD helpers for the transactions table.
"""
from sqlalchemy.orm import Session

from .models import Transaction


def save_transaction(
    db: Session,
    *,
    name: str,
    amount: float,
    device: str,
    ip_address: str,
    fraud_probability: float,
    risk_level: str,
) -> Transaction:
    """Insert a new transaction record and return it."""
    record = Transaction(
        name=name,
        amount=amount,
        device=device,
        ip_address=ip_address,
        fraud_probability=fraud_probability,
        risk_level=risk_level,
    )
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
