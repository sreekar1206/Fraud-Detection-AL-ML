"""
Pydantic schemas for request / response validation.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TransactionRequest(BaseModel):
    """Input from the frontend form."""
    name: str = Field(..., min_length=1, max_length=100, description="Customer name")
    amount: float = Field(..., gt=0, description="Transaction amount in USD")
    device: str = Field(..., description="Device type: Mobile, Desktop, or Tablet")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"name": "Alice", "amount": 5000, "device": "Mobile"}
            ]
        }
    }


class TransactionOut(BaseModel):
    """Response returned to the frontend."""
    name: str
    amount: float
    ip_address: str
    fraud_probability: float   # 0–100 %
    risk_level: str            # Low / Medium / High
    timestamp: Optional[datetime] = None

    model_config = {"from_attributes": True}
