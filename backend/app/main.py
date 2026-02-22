"""
FastAPI application entry point.

- Auto-trains the ML model on first startup if no model file exists.
- Creates database tables.
- Includes the transaction router.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS, MODEL_PATH
from .database import engine, Base
from .routes.transactions import router as transactions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create DB tables and auto-train model if missing."""
    # Delete old DB so schema is always fresh (demo app)
    db_file = "fraud_detection.db"
    if os.path.exists(db_file):
        os.remove(db_file)

    Base.metadata.create_all(bind=engine)
    print("[APP] Database tables created.")

    # Auto-train model if it doesn't exist
    if not os.path.exists(MODEL_PATH):
        print("[APP] No model found — training now...")
        from .ml.train import train_and_save_model
        msg = train_and_save_model()
        print(f"[APP] {msg}")
    else:
        print(f"[APP] Model loaded from {MODEL_PATH}")

    yield
    print("[APP] Shutting down.")


app = FastAPI(
    title="FraudShield AI — Fraud Detection API",
    description="AI-Powered Fraud Detection Demo with RandomForest ML.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(transactions_router)


@app.get("/")
async def root():
    """Health check."""
    return {
        "name": "FraudShield AI",
        "version": "2.0.0",
        "status": "active",
        "docs": "/docs",
    }
