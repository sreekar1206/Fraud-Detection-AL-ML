"""
FastAPI application entry point.

- Auto-trains both the simple RF model and the advanced ensemble on startup.
- Creates all database tables.
- Includes the transaction router.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS, MODEL_PATH, ENSEMBLE_DIR
from .database import engine, Base
from .routes.transactions import router as transactions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and train models if missing."""
    # Fresh DB for demo (schema changes each iteration)
    db_file = "fraud_detection.db"
    if os.path.exists(db_file):
        os.remove(db_file)

    Base.metadata.create_all(bind=engine)
    print("[APP] Database tables created.")

    # ── Simple model ──
    if not os.path.exists(MODEL_PATH):
        print("[APP] Training simple RF model...")
        from .ml.train import train_and_save_model
        print(f"[APP] {train_and_save_model()}")
    else:
        print(f"[APP] Simple model loaded from {MODEL_PATH}")

    # ── Ensemble models (XGBoost + IsolationForest) ──
    champ_path = os.path.join(ENSEMBLE_DIR, "champion_xgb.pkl")
    if not os.path.exists(champ_path):
        print("[APP] Training ensemble (XGBoost + IsolationForest)...")
        from .engine.ensemble import train_ensemble
        print(f"[APP] {train_ensemble()}")
    else:
        print(f"[APP] Ensemble models loaded from {ENSEMBLE_DIR}")

    yield
    print("[APP] Shutting down.")


app = FastAPI(
    title="FraudShield AI — Advanced Fraud Detection Engine",
    description=(
        "Multi-dimensional fraud detection with ensemble ML, "
        "behavioral features, dynamic thresholds, SHAP explainability, "
        "graph contagion analysis, and champion-challenger adaptive learning."
    ),
    version="3.0.0",
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
    return {
        "name": "FraudShield AI",
        "version": "3.0.0",
        "status": "active",
        "engine": "Ensemble (XGBoost + IsolationForest) with behavioral features",
        "docs": "/docs",
    }
