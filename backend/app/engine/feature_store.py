"""
Redis-backed Feature Store with in-memory fallback.

Provides sub-10ms lookups for behavioural features:
  - Transaction velocity  (sorted sets by timestamp)
  - Amount sums           (sliding window)
  - Last known location   (hash)

When Redis is unavailable the store falls back to plain Python dicts
so the demo runs locally with zero infrastructure.
"""
from __future__ import annotations

import time
import json
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

try:
    import redis
    _REDIS_AVAILABLE = True
except ImportError:
    _REDIS_AVAILABLE = False


class FeatureStore:
    """Unified interface — Redis when possible, in-memory otherwise."""

    def __init__(self, redis_url: Optional[str] = None):
        self._redis = None
        if redis_url and _REDIS_AVAILABLE:
            try:
                self._redis = redis.from_url(redis_url, decode_responses=True)
                self._redis.ping()
                print("[FEATURE_STORE] Connected to Redis ✓")
            except Exception:
                self._redis = None
                print("[FEATURE_STORE] Redis unavailable — falling back to in-memory store")
        else:
            print("[FEATURE_STORE] Using in-memory feature store")

        # In-memory fallback structures
        self._mem_txns: dict[str, list[dict]] = defaultdict(list)
        self._mem_locations: dict[str, dict] = {}

    # ── Write ────────────────────────────────────────────────

    def record_transaction(
        self,
        user_id: str,
        amount: float,
        timestamp: Optional[datetime] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> None:
        """Record a transaction for velocity calculations."""
        ts = timestamp or datetime.utcnow()
        epoch = ts.timestamp()

        if self._redis:
            pipe = self._redis.pipeline()
            # Sorted set: score = epoch, member = json payload
            payload = json.dumps({"amount": amount, "ts": epoch})
            pipe.zadd(f"tx:{user_id}", {payload: epoch})
            # Trim to last 24 h
            cutoff = (ts - timedelta(hours=24)).timestamp()
            pipe.zremrangebyscore(f"tx:{user_id}", "-inf", cutoff)
            # Location hash
            if lat is not None and lon is not None:
                pipe.hset(f"loc:{user_id}", mapping={
                    "lat": str(lat), "lon": str(lon), "ts": str(epoch)
                })
            pipe.execute()
        else:
            self._mem_txns[user_id].append({"amount": amount, "ts": epoch})
            # Trim
            cutoff = (ts - timedelta(hours=24)).timestamp()
            self._mem_txns[user_id] = [
                t for t in self._mem_txns[user_id] if t["ts"] >= cutoff
            ]
            if lat is not None and lon is not None:
                self._mem_locations[user_id] = {
                    "lat": lat, "lon": lon, "ts": epoch
                }

    # ── Read ─────────────────────────────────────────────────

    def get_velocity(
        self, user_id: str, window_hours: int = 1,
    ) -> tuple[int, float]:
        """
        Return (tx_count, amount_sum) within the last ``window_hours``.
        Target: < 10 ms with Redis.
        """
        cutoff = (datetime.utcnow() - timedelta(hours=window_hours)).timestamp()

        if self._redis:
            raw = self._redis.zrangebyscore(f"tx:{user_id}", cutoff, "+inf")
            count = len(raw)
            total = sum(json.loads(r)["amount"] for r in raw)
            return count, round(total, 2)

        txns = [t for t in self._mem_txns.get(user_id, []) if t["ts"] >= cutoff]
        return len(txns), round(sum(t["amount"] for t in txns), 2)

    def get_recent_transactions(
        self, user_id: str, hours: int = 24,
    ) -> list[dict]:
        """Return recent transactions as list of dicts with ``amount`` and ``timestamp``."""
        cutoff = (datetime.utcnow() - timedelta(hours=hours)).timestamp()

        if self._redis:
            raw = self._redis.zrangebyscore(f"tx:{user_id}", cutoff, "+inf")
            results = []
            for r in raw:
                d = json.loads(r)
                results.append({
                    "amount": d["amount"],
                    "timestamp": datetime.utcfromtimestamp(d["ts"]),
                })
            return results

        return [
            {"amount": t["amount"], "timestamp": datetime.utcfromtimestamp(t["ts"])}
            for t in self._mem_txns.get(user_id, [])
            if t["ts"] >= cutoff
        ]

    def get_last_location(self, user_id: str) -> Optional[dict]:
        """Return last known {lat, lon, ts} or None."""
        if self._redis:
            data = self._redis.hgetall(f"loc:{user_id}")
            if data:
                return {
                    "lat": float(data["lat"]),
                    "lon": float(data["lon"]),
                    "ts": float(data["ts"]),
                }
            return None

        loc = self._mem_locations.get(user_id)
        return loc if loc else None
