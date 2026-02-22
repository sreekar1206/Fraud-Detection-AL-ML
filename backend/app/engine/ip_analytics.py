"""
IP Traffic Density Analytics.

Tracks transaction volume per IP address to identify:
  - Heavy IP traffic (potential bot/automated attacks)
  - IP clustering patterns
  - Suspicious IP behavior
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models import Transaction


class IPAnalytics:
    """Analyzes IP traffic patterns for fraud detection."""
    
    def __init__(self):
        self._cache: dict[str, dict] = {}
        self._cache_ttl = timedelta(minutes=5)
    
    def get_ip_traffic_density(
        self,
        db: Session,
        ip_address: str,
        window_hours: int = 24,
    ) -> float:
        """
        Calculate transaction density for an IP address.
        
        Returns:
            Number of transactions from this IP in the last window_hours
        """
        cutoff = datetime.utcnow() - timedelta(hours=window_hours)
        
        count = (
            db.query(func.count(Transaction.id))
            .filter(
                Transaction.ip_address == ip_address,
                Transaction.timestamp >= cutoff,
            )
            .scalar()
        ) or 0
        
        return float(count)
    
    def get_top_ips(
        self,
        db: Session,
        window_hours: int = 24,
        limit: int = 10,
    ) -> list[dict]:
        """
        Get IPs with highest transaction volume.
        
        Returns:
            List of {ip_address, count, risk_level} dicts
        """
        cutoff = datetime.utcnow() - timedelta(hours=window_hours)
        
        results = (
            db.query(
                Transaction.ip_address,
                func.count(Transaction.id).label("count"),
            )
            .filter(Transaction.timestamp >= cutoff)
            .group_by(Transaction.ip_address)
            .order_by(func.count(Transaction.id).desc())
            .limit(limit)
            .all()
        )
        
        return [
            {
                "ip_address": ip,
                "count": count,
                "risk_level": self._classify_ip_risk(count),
            }
            for ip, count in results
        ]
    
    def _classify_ip_risk(self, count: int) -> str:
        """Classify IP risk based on transaction count."""
        if count >= 50:
            return "Critical"
        elif count >= 20:
            return "High"
        elif count >= 10:
            return "Medium"
        else:
            return "Low"
    
    def analyze_ip_patterns(
        self,
        db: Session,
        ip_address: str,
    ) -> dict:
        """
        Comprehensive IP pattern analysis.
        
        Returns:
            {
                "traffic_density_24h": float,
                "unique_users": int,
                "avg_amount": float,
                "fraud_rate": float,
                "risk_level": str,
            }
        """
        cutoff_24h = datetime.utcnow() - timedelta(hours=24)
        
        txns = (
            db.query(Transaction)
            .filter(
                Transaction.ip_address == ip_address,
                Transaction.timestamp >= cutoff_24h,
            )
            .all()
        )
        
        if not txns:
            return {
                "traffic_density_24h": 0.0,
                "unique_users": 0,
                "avg_amount": 0.0,
                "fraud_rate": 0.0,
                "risk_level": "Low",
            }
        
        unique_users = len(set(t.user_id for t in txns if t.user_id))
        avg_amount = sum(t.amount for t in txns) / len(txns)
        flagged_count = sum(1 for t in txns if t.flagged)
        fraud_rate = flagged_count / len(txns) if txns else 0.0
        
        # Risk classification
        risk_score = 0.0
        if len(txns) >= 50:
            risk_score += 0.4
        if unique_users >= 10:
            risk_score += 0.3
        if fraud_rate >= 0.3:
            risk_score += 0.3
        
        if risk_score >= 0.7:
            risk_level = "Critical"
        elif risk_score >= 0.4:
            risk_level = "High"
        elif risk_score >= 0.2:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return {
            "traffic_density_24h": float(len(txns)),
            "unique_users": unique_users,
            "avg_amount": round(avg_amount, 2),
            "fraud_rate": round(fraud_rate, 3),
            "risk_level": risk_level,
        }
