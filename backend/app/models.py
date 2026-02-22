"""
SQLAlchemy ORM models for the fraud detection database.
"""
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text
from sqlalchemy.sql import func

from .database import Base


class Transaction(Base):
    """Stores a transaction record with full advanced fraud analysis."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    device = Column(String(50), nullable=False)
    ip_address = Column(String(45), nullable=False)

    # Simple model result (kept for backwards compat)
    fraud_probability = Column(Float, nullable=False, default=0.0)
    risk_level = Column(String(10), nullable=False, default="Low")

    # Advanced engine results
    risk_score = Column(Float, nullable=True)           # 0-100 ensemble
    xgb_proba = Column(Float, nullable=True)
    iso_score = Column(Float, nullable=True)
    threshold_used = Column(Float, nullable=True)
    flagged = Column(Boolean, nullable=True)
    shap_reasons = Column(Text, nullable=True)          # JSON string
    graph_flagged = Column(Boolean, default=False)

    # Behavioural features (stored for audit)
    tx_count_1h = Column(Integer, nullable=True)
    tx_amount_sum_24h = Column(Float, nullable=True)
    impossible_travel = Column(Boolean, default=False)
    amount_ratio = Column(Float, nullable=True)
    velocity_score = Column(Float, nullable=True)

    # User context
    user_id = Column(String(100), nullable=True)
    account_age_days = Column(Integer, default=0)
    trust_score = Column(Float, default=0.5)

    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Transaction(id={self.id}, name={self.name}, risk={self.risk_level})>"


class UserProfile(Base):
    """User reputation and history metadata."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(100), unique=True, nullable=False)
    account_age_days = Column(Integer, default=0)
    trust_score = Column(Float, default=0.5)
    avg_amount_30d = Column(Float, default=0.0)
    total_transactions = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FeedbackLog(Base):
    """Admin fraud confirmations for the feedback loop."""
    __tablename__ = "feedback_log"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(Integer, nullable=False)
    confirmed_fraud = Column(Boolean, nullable=False)
    admin_id = Column(String(100), default="admin")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
