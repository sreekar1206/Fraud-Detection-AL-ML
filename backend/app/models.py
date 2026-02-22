"""
SQLAlchemy ORM model for the fraud detection database.
"""
from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func

from .database import Base


class Transaction(Base):
    """Stores a transaction record with its fraud prediction."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    device = Column(String(50), nullable=False)
    ip_address = Column(String(45), nullable=False)
    fraud_probability = Column(Float, nullable=False)   # 0–100 %
    risk_level = Column(String(10), nullable=False)      # Low / Medium / High
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Transaction(id={self.id}, name={self.name}, risk={self.risk_level})>"
