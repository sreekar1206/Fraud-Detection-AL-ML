"""
Transaction API routes.

POST /api/transaction  – analyse a transaction
GET  /api/history      – retrieve all past transactions
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import TransactionRequest, TransactionOut
from ..crud import save_transaction, get_all_transactions
from ..ml.predict import predict_fraud

router = APIRouter(tags=["Transactions"])


@router.post("/api/transaction", response_model=TransactionOut)
async def create_transaction(
    payload: TransactionRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Accept a transaction, run the ML model, persist, and return the result.
    """
    # Detect client IP
    ip_address = request.client.host if request.client else "127.0.0.1"

    # Current hour for the model feature
    current_hour = datetime.now().hour

    # Run prediction
    try:
        result = predict_fraud(
            amount=payload.amount,
            device=payload.device,
            hour=current_hour,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    # Save to database
    try:
        record = save_transaction(
            db,
            name=payload.name,
            amount=payload.amount,
            device=payload.device,
            ip_address=ip_address,
            fraud_probability=result["fraud_probability"],
            risk_level=result["risk_level"],
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    return TransactionOut(
        name=record.name,
        amount=record.amount,
        ip_address=record.ip_address,
        fraud_probability=record.fraud_probability,
        risk_level=record.risk_level,
        timestamp=record.timestamp,
    )


@router.get("/api/history", response_model=list[TransactionOut])
async def transaction_history(db: Session = Depends(get_db)):
    """Return all transactions sorted newest first."""
    return get_all_transactions(db)
