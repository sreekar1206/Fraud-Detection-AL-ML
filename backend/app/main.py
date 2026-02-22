"""
FastAPI application entry point.

- Auto-trains both the simple RF model and the advanced ensemble on startup.
- Creates all database tables.
- Seeds sample historical data if the DB is empty.
- Includes the transaction router.
"""
import os
import json
import random
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS, MODEL_PATH, ENSEMBLE_DIR
from .database import engine, Base, SessionLocal
from .routes.transactions import router as transactions_router


def _seed_sample_data(db):
    """Seed realistic sample transactions so Dashboard/Forensics are populated from the start."""
    from .models import Transaction, UserProfile

    if db.query(Transaction).count() > 0:
        return  # Already has data

    print("[APP] Seeding sample transaction data...")
    random.seed(42)

    sample_names = [
        "Alice Johnson", "Bob Smith", "Carol White", "David Lee",
        "Emma Brown", "Frank Martin", "Grace Kim", "Henry Taylor",
        "Iris Chen", "Jack Wilson", "Kate Davis", "Liam Anderson",
        "Mia Thompson", "Noah Garcia", "Olivia Martinez", "Paul Robinson",
    ]
    devices = ["Mobile", "Desktop", "Tablet"]
    ip_pool = [
        "192.168.1.100", "10.0.0.5", "172.16.0.50",
        "203.0.113.42", "198.51.100.7", "198.51.100.23",
        "127.0.0.1", "203.0.113.88", "198.51.100.99",
    ]

    now = datetime.utcnow()

    # Create sample users
    users_created = set()
    for name in sample_names:
        uid = name.lower().replace(" ", "_")
        if uid not in users_created:
            profile = UserProfile(
                user_id=uid,
                account_age_days=random.randint(30, 1825),
                trust_score=round(random.uniform(0.3, 0.9), 2),
                avg_amount_30d=round(random.uniform(100, 5000), 2),
                total_transactions=random.randint(5, 200),
            )
            db.add(profile)
            users_created.add(uid)
    db.commit()

    # Seed 50 historical transactions over the past 7 days
    transactions_to_seed = []
    for i in range(50):
        is_fraud = random.random() < 0.25  # 25% fraud rate
        days_ago = random.uniform(0, 7)
        hours_offset = random.uniform(0, 24)
        tx_time = now - timedelta(days=days_ago, hours=hours_offset)

        name = random.choice(sample_names)
        user_id = name.lower().replace(" ", "_")
        ip = random.choice(ip_pool)
        device = random.choice(devices)

        if is_fraud:
            amount = round(random.uniform(5000, 80000), 2)
            risk_score = round(random.uniform(65, 98), 2)
            risk_level = "High"
            xgb = round(random.uniform(0.7, 0.98), 4)
            iso = round(random.uniform(0.3, 0.7), 4)
            hour = random.choice([0, 1, 2, 3, 4, 22, 23])
        else:
            amount = round(random.uniform(20, 3000), 2)
            risk_score = round(random.uniform(5, 40), 2)
            risk_level = "Low" if risk_score < 20 else "Medium"
            xgb = round(random.uniform(0.02, 0.35), 4)
            iso = round(random.uniform(0.05, 0.35), 4)
            hour = random.randint(8, 21)

        tx_time = tx_time.replace(hour=hour)
        threshold = round(random.uniform(0.30, 0.55), 3)
        flagged = (risk_score / 100.0) > threshold

        # Build SHAP reasons
        shap_reasons = []
        if is_fraud:
            shap_reasons = [
                f"Transaction Amount (${amount:,.2f}) increased risk by {round(random.uniform(20, 45), 1)}%",
                f"Time of Day ({hour}:00) increased risk by {round(random.uniform(10, 25), 1)}%",
                f"Transaction Velocity ({random.randint(3,8)}) increased risk by {round(random.uniform(5, 15), 1)}%",
            ]

        tx = Transaction(
            name=name,
            amount=amount,
            device=device,
            ip_address=ip,
            fraud_probability=risk_score,
            risk_level=risk_level,
            risk_score=risk_score,
            xgb_proba=xgb,
            iso_score=iso,
            threshold_used=threshold,
            flagged=flagged,
            shap_reasons=json.dumps(shap_reasons) if shap_reasons else None,
            graph_flagged=random.random() < 0.05,
            tx_count_1h=random.randint(0, 5),
            tx_amount_sum_24h=round(random.uniform(0, 50000), 2),
            impossible_travel=random.random() < 0.1,
            amount_ratio=round(random.uniform(0.5, 10.0), 4),
            velocity_score=round(random.uniform(0, 0.8), 4),
            user_id=user_id,
            account_age_days=random.randint(30, 1825),
            trust_score=round(random.uniform(0.3, 0.9), 2),
            is_vpn=ip.startswith(("192.168", "10.", "172.16", "127.")),
            ip_traffic_density=round(random.uniform(1, 15), 1),
            timestamp=tx_time,
        )
        transactions_to_seed.append(tx)

    db.add_all(transactions_to_seed)
    db.commit()
    print(f"[APP] Seeded {len(transactions_to_seed)} sample transactions across 7 days.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables, train models if missing, seed sample data."""
    # Create tables without dropping existing ones (preserve data between restarts)
    Base.metadata.create_all(bind=engine)
    print("[APP] Database tables created/verified.")

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

    # ── Seed sample data if DB is empty ──
    db = SessionLocal()
    try:
        _seed_sample_data(db)
    finally:
        db.close()

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
