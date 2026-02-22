"""
Behavioral Feature Engineering for fraud detection.

Computes contextual features from raw transaction data:
  - Velocity:  tx_count_1h, tx_amount_sum_24h  (sliding window)
  - Geospatial: impossible_travel flag          (Haversine)
  - Deviation:  amount_ratio                    (vs 30-day avg)
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional


@dataclass
class LocationPoint:
    lat: float
    lon: float
    timestamp: datetime


@dataclass
class BehavioralFeatures:
    """All contextual features computed for a single transaction."""
    tx_count_1h: int = 0
    tx_amount_sum_24h: float = 0.0
    impossible_travel: bool = False
    amount_ratio: float = 1.0       # current_amount / 30d_avg
    velocity_score: float = 0.0     # normalised 0-1


class BehavioralFeatureEngine:
    """
    Calculates real-time behavioural features.

    In production this reads from Redis / a feature store.
    Here it operates on in-memory lists for demo purposes.
    """

    # ── Haversine ────────────────────────────────────────────
    EARTH_RADIUS_KM = 6_371.0
    MAX_HUMAN_SPEED_KPH = 900      # fastest commercial jet

    @staticmethod
    def _haversine_km(lat1: float, lon1: float,
                      lat2: float, lon2: float) -> float:
        """Great-circle distance between two points in km."""
        rlat1, rlat2 = math.radians(lat1), math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)

        a = (math.sin(dlat / 2) ** 2
             + math.cos(rlat1) * math.cos(rlat2)
             * math.sin(dlon / 2) ** 2)
        return 2 * BehavioralFeatureEngine.EARTH_RADIUS_KM * math.asin(math.sqrt(a))

    # ── Public API ───────────────────────────────────────────

    def compute(
        self,
        *,
        current_amount: float,
        recent_transactions: list[dict],
        avg_amount_30d: float,
        last_location: Optional[LocationPoint] = None,
        current_location: Optional[LocationPoint] = None,
    ) -> BehavioralFeatures:
        """
        Compute all behavioural features for the current transaction.

        Args:
            current_amount:       Dollar value of the incoming tx.
            recent_transactions:  List of dicts with keys ``amount``, ``timestamp`` (datetime).
            avg_amount_30d:       User's rolling 30-day average amount.
            last_location:        Previous tx location (lat/lon/time).
            current_location:     Current tx location (lat/lon/time).
        """
        now = datetime.utcnow()
        one_hour_ago = now - timedelta(hours=1)
        one_day_ago = now - timedelta(hours=24)

        # ── Velocity ──
        tx_count_1h = sum(
            1 for tx in recent_transactions
            if tx.get("timestamp") and tx["timestamp"] >= one_hour_ago
        )
        tx_amount_sum_24h = sum(
            tx.get("amount", 0.0) for tx in recent_transactions
            if tx.get("timestamp") and tx["timestamp"] >= one_day_ago
        )

        # ── Deviation ──
        amount_ratio = (
            current_amount / avg_amount_30d if avg_amount_30d > 0 else 1.0
        )

        # ── Impossible Travel ──
        impossible = False
        if last_location and current_location:
            dist_km = self._haversine_km(
                last_location.lat, last_location.lon,
                current_location.lat, current_location.lon,
            )
            dt_hours = max(
                (current_location.timestamp - last_location.timestamp).total_seconds() / 3600,
                0.001,
            )
            speed_kph = dist_km / dt_hours
            impossible = speed_kph > self.MAX_HUMAN_SPEED_KPH

        # ── Velocity score (normalised) ──
        velocity_score = min(tx_count_1h / 10.0, 1.0)

        return BehavioralFeatures(
            tx_count_1h=tx_count_1h,
            tx_amount_sum_24h=round(tx_amount_sum_24h, 2),
            impossible_travel=impossible,
            amount_ratio=round(amount_ratio, 4),
            velocity_score=round(velocity_score, 4),
        )
