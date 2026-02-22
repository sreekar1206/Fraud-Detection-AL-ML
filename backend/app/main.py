"""
FastAPI application entry point.

Sets up CORS, includes routers, and provides the /train-model endpoint.
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import CORS_ORIGINS
from .database import engine, Base
from .schemas import TrainResponse
from .routes.transactions import router as transactions_router
from .routes.auth import verify_api_key


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    print("[APP] Database tables created successfully.")
    yield
    print("[APP] Shutting down...")


app = FastAPI(
    title="FraudShield AI — Fraud Detection API",
    description=(
        "AI-Powered Fraud Detection System with ensemble ML models. "
        "Supports real-time transaction analysis, model training, "
        "and fraud statistics."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions_router)


@app.get("/")
async def root():
    """API health check endpoint."""
    return {
        "name": "FraudShield AI",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs",
    }


@app.post("/train-model", response_model=TrainResponse)
async def train_model(
    _auth: bool = Depends(verify_api_key),
):
    """
    Train ML models and save the best performer.
    Generates synthetic data, applies SMOTE, trains 4 models,
    and selects the best based on F1 score.
    """
    try:
        from .ml.train import train_models
        result = train_models()
        return TrainResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Training failed: {str(e)}"
        )
