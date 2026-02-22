"""
SQLAlchemy ORM models for the fraud detection database.
"""
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime
from sqlalchemy.sql import func

from .database import Base


class Transaction(Base):
    """Stores transaction data and fraud prediction results."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    transaction_time = Column(Float, nullable=False)
    location = Column(String(100), nullable=False)
    device_type = Column(String(50), nullable=False)
    merchant_id = Column(String(50), nullable=False)

    # Prediction results
    fraud_probability = Column(Float, nullable=True)
    is_fraud = Column(Boolean, nullable=True)
    fraud_score = Column(Float, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    model_used = Column(String(100), nullable=True)

    def __repr__(self):
        return f"<Transaction(id={self.id}, amount={self.amount}, is_fraud={self.is_fraud})>"
