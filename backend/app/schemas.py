"""
Pydantic schemas for request / response validation.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TransactionRequest(BaseModel):
    """Input from the frontend form."""
    name: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    device: str = Field(...)
    user_id: Optional[str] = Field(default=None, description="Optional user ID for behavioural tracking")

    model_config = {
        "json_schema_extra": {
            "examples": [{"name": "Alice", "amount": 5000, "device": "Mobile", "user_id": "alice_01"}]
        }
    }


class TransactionOut(BaseModel):
    """Full response with advanced analysis."""
    name: str
    amount: float
    ip_address: str
    fraud_probability: float
    risk_level: str
    timestamp: Optional[datetime] = None

    # Advanced engine
    risk_score: Optional[float] = None
    xgb_proba: Optional[float] = None
    iso_score: Optional[float] = None
    threshold_used: Optional[float] = None
    flagged: Optional[bool] = None
    shap_reasons: Optional[list[str]] = None
    graph_flagged: Optional[bool] = None

    # Behavioural
    tx_count_1h: Optional[int] = None
    tx_amount_sum_24h: Optional[float] = None
    impossible_travel: Optional[bool] = None
    amount_ratio: Optional[float] = None
    velocity_score: Optional[float] = None

    # User context
    trust_score: Optional[float] = None
    account_age_days: Optional[int] = None

    model_config = {"from_attributes": True}


class FeedbackRequest(BaseModel):
    """Admin confirms or denies fraud on a transaction."""
    transaction_id: int
    is_fraud: bool
    admin_id: str = "admin"


class FeedbackOut(BaseModel):
    status: str
    transaction_id: int
    confirmed_fraud: bool


class RetrainOut(BaseModel):
    swapped: bool
    champion_f1: Optional[float] = None
    challenger_f1: Optional[float] = None
    message: str
