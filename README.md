# FraudShield AI — Advanced Fraud Detection Engine

> **AI/ML-based real-time fraud detection** for online banking transactions.  
> Ensemble learning · Behavioral analysis · Self-correcting models · Explainable AI

---

## Why This Architecture Solves the "Static Model" Problem

Traditional single-model fraud systems suffer from three critical drawbacks:

| Problem | Root Cause | Our Solution |
|---|---|---|
| **Concept Drift** | Fraud patterns evolve; a static model trained once goes stale | **Champion-Challenger pipeline** automatically retrains and swaps the model when a challenger beats the champion on F1 score |
| **High False Positives** | A hard 0.5 cutoff treats all users the same | **Dynamic Bayesian Threshold** shifts based on `account_age` and `trust_score` — stricter for new accounts, lenient for established customers |
| **Missed Novel Attacks** | Supervised models only catch patterns they were trained on | **Hybrid Ensemble** combines XGBoost (supervised) with IsolationForest (unsupervised anomaly detection) to catch zero-day fraud patterns |

### Additional Capabilities

- **Behavioral Feature Engine** — Calculates real-time velocity (tx/hour), 24h volume, impossible-travel flags (Haversine formula), and amount deviation ratio
- **Redis Feature Store** — Sub-10ms behavioural lookups in production; graceful in-memory fallback for local dev
- **SHAP Explainability** — Returns top-3 human-readable reasons for every flagged transaction (e.g., _"Transaction Amount ($45,000) increased risk by 32%"_)
- **Network Contagion** — NetworkX graph analysis flags accounts within 2 hops of known mule accounts
- **Admin Feedback Loop** — Analysts confirm/deny fraud → data feeds back into the next challenger training cycle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | **FastAPI** (Python 3.11+) |
| Database | **SQLite** (demo) — swap to PostgreSQL for production |
| ML Models | **XGBoost** + **IsolationForest** (scikit-learn) |
| Explainability | **SHAP** (TreeExplainer) |
| Graph Analysis | **NetworkX** |
| Feature Store | **Redis** (optional) / in-memory fallback |
| Frontend | **React 18** + **Vite** + **TailwindCSS** + **Three.js** + **Framer Motion** |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI entry point (auto-trains on startup)
│   ├── config.py               # All configuration
│   ├── database.py             # SQLAlchemy engine + session
│   ├── models.py               # ORM: Transaction, UserProfile, FeedbackLog
│   ├── schemas.py              # Pydantic request/response models
│   ├── crud.py                 # Database operations
│   ├── ml/
│   │   ├── train.py            # Simple RandomForest (3-feature fast path)
│   │   └── predict.py          # Simple model prediction
│   ├── engine/
│   │   ├── features.py         # BehavioralFeatureEngine (velocity, Haversine, deviation)
│   │   ├── feature_store.py    # Redis / in-memory feature store
│   │   ├── ensemble.py         # XGBoost + IsolationForest weighted ensemble
│   │   ├── threshold.py        # Dynamic Bayesian threshold
│   │   ├── explainability.py   # SHAP top-3 reasons
│   │   ├── graph.py            # NetworkX contagion analysis
│   │   ├── champion_challenger.py  # Adaptive model swapping
│   │   └── feedback.py         # Admin feedback loop
│   └── routes/
│       └── transactions.py     # API endpoints
├── requirements.txt
└── fraud_detection.db          # Auto-created on startup

frontend/
├── src/
│   ├── pages/Detection.jsx     # Advanced analysis form + result card
│   ├── services/api.js         # API client
│   └── components/             # Reusable UI components
├── package.json
└── vite.config.js
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/transaction` | Submit transaction → full pipeline analysis |
| `GET` | `/api/history` | All transactions (newest first) |
| `POST` | `/api/feedback` | Admin confirms/denies fraud on a transaction |
| `POST` | `/api/retrain` | Trigger champion-challenger evaluation + swap |
| `GET` | `/docs` | Interactive Swagger UI |

### Example: POST /api/transaction

**Request:**
```json
{
  "name": "Alice",
  "amount": 45000,
  "device": "Mobile"
}
```

**Response:**
```json
{
  "name": "Alice",
  "amount": 45000.0,
  "ip_address": "127.0.0.1",
  "fraud_probability": 78.5,
  "risk_level": "High",
  "risk_score": 78.5,
  "xgb_proba": 0.92,
  "iso_score": 0.45,
  "threshold_used": 0.35,
  "flagged": true,
  "shap_reasons": [
    "Transaction Amount ($45,000.00) increased risk by 34.2%",
    "Time of Day (2:00) increased risk by 18.7%",
    "Transaction Velocity (0.1) decreased risk by 3.1%"
  ],
  "graph_flagged": false,
  "tx_count_1h": 0,
  "tx_amount_sum_24h": 0.0,
  "impossible_travel": false,
  "amount_ratio": 1.0,
  "velocity_score": 0.0,
  "trust_score": 0.5,
  "account_age_days": 0,
  "timestamp": "2026-02-22T13:30:00"
}
```

---

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# → Models auto-train on first launch

# Frontend
cd frontend
npm install
npm run dev
# → Open http://localhost:5173/detection
```

### Optional: Enable Redis Feature Store
```bash
# Start Redis (Docker)
docker run -d -p 6379:6379 redis

# Set environment variable
set REDIS_URL=redis://localhost:6379/0
python -m uvicorn app.main:app --reload
```

---

## Pipeline Flow

```
Transaction Request
       │
       ▼
┌─────────────────────┐
│ Behavioral Features  │  tx_count_1h, volume_24h, Haversine, deviation
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   Feature Store      │  Redis (< 10ms) or in-memory
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Hybrid Ensemble     │  0.7 × XGBoost + 0.3 × IsolationForest
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Dynamic Threshold    │  Sigmoid(account_age, trust_score)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ SHAP Explainability  │  Top-3 human-readable reasons
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Graph Contagion      │  NetworkX: 2-hop mule proximity
└──────────┬──────────┘
           ▼
    Risk Decision + DB Store
           │
           ▼
    Admin Feedback Loop → Champion-Challenger Retrain
```
