"""
Transaction and prediction API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    TransactionCreate,
    TransactionResponse,
    PredictionResponse,
    StatsResponse,
)
from ..crud import create_transaction, get_transactions, get_stats
from ..ml.predict import predict_fraud
from .auth import verify_api_key

router = APIRouter(prefix="/api/v1", tags=["Transactions"])


@router.post("/predict", response_model=PredictionResponse)
async def predict_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    _auth: bool = Depends(verify_api_key),
):
    """
    Accept a transaction JSON, predict fraud probability, store result in DB,
    and return the prediction.
    """
    try:
        # Run prediction
        prediction = predict_fraud(transaction.model_dump())
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    # Store transaction + prediction in database
    try:
        db_transaction = create_transaction(db, transaction, prediction)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return PredictionResponse(
        transaction_id=db_transaction.id,
        amount=transaction.amount,
        fraud_probability=prediction["fraud_probability"],
        is_fraud=prediction["is_fraud"],
        fraud_score=prediction["fraud_score"],
        risk_level=prediction["risk_level"],
        model_used=prediction["model_used"],
        message=f"Transaction analyzed. Risk level: {prediction['risk_level']}",
    )


@router.get("/transactions", response_model=list[TransactionResponse])
async def list_transactions(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    _auth: bool = Depends(verify_api_key),
):
    """
    Fetch all transactions with pagination.
    """
    try:
        transactions = get_transactions(db, skip=skip, limit=limit)
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/stats", response_model=StatsResponse)
async def get_detection_stats(
    db: Session = Depends(get_db),
    _auth: bool = Depends(verify_api_key),
):
    """
    Return fraud detection statistics computed from all stored transactions.
    """
    try:
        stats = get_stats(db)
        return StatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
