"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --- Request Schemas ---

class TransactionCreate(BaseModel):
    """Input schema for creating a transaction / requesting a prediction."""
    amount: float = Field(..., gt=0, description="Transaction amount in USD")
    transaction_time: float = Field(..., description="Transaction timestamp (epoch or relative)")
    location: str = Field(..., min_length=1, max_length=100, description="Transaction location")
    device_type: str = Field(..., min_length=1, max_length=50, description="Device type (Mobile, Desktop, etc.)")
    merchant_id: str = Field(..., min_length=1, max_length=50, description="Merchant identifier")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "amount": 1200,
                    "transaction_time": 34234,
                    "location": "Hyderabad",
                    "device_type": "Mobile",
                    "merchant_id": "M123"
                }
            ]
        }
    }


# --- Response Schemas ---

class TransactionResponse(BaseModel):
    """Response schema for a transaction record."""
    id: int
    amount: float
    transaction_time: float
    location: str
    device_type: str
    merchant_id: str
    fraud_probability: Optional[float] = None
    is_fraud: Optional[bool] = None
    fraud_score: Optional[float] = None
    created_at: Optional[datetime] = None
    model_used: Optional[str] = None

    model_config = {"from_attributes": True}


class PredictionResponse(BaseModel):
    """Response schema for a fraud prediction."""
    transaction_id: int
    amount: float
    fraud_probability: float
    is_fraud: bool
    fraud_score: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    model_used: str
    message: str


class TrainResponse(BaseModel):
    """Response schema for the model training endpoint."""
    status: str
    best_model: str
    metrics: dict
    all_models_metrics: dict
    training_samples: int
    message: str


class StatsResponse(BaseModel):
    """Response schema for fraud detection statistics."""
    total_transactions: int
    total_fraud: int
    total_legitimate: int
    fraud_rate: float
    average_fraud_probability: float
    high_risk_transactions: int
    model_accuracy: Optional[float] = None
