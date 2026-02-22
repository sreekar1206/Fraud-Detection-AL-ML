"""
Daily Risk Insights & Analytics.

Generates high-level aggregates for dashboard:
  - Fraud percentage by day
  - VPN usage statistics
  - IP traffic density patterns
  - Nighttime attack monitoring
  - Geographic risk distribution

If there are no transactions today, returns all-time aggregates as a fallback.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_

from ..models import Transaction


def get_daily_insights(db: Session, date: datetime | None = None) -> dict:
    """
    Generate comprehensive daily risk insights.
    Falls back to all-time data if no transactions exist for requested date.
    """
    if date is None:
        date = datetime.utcnow()

    start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)

    # Base query for today's transactions
    base_query = db.query(Transaction).filter(
        and_(
            Transaction.timestamp >= start_of_day,
            Transaction.timestamp < end_of_day,
        )
    )

    total_txns = base_query.count()

    # Fallback: if no transactions today, use all-time data
    if total_txns == 0:
        base_query = db.query(Transaction)
        total_txns = base_query.count()
        date_label = "All Time"
    else:
        date_label = date.strftime("%Y-%m-%d")

    if total_txns == 0:
        return {
            "date": date_label,
            "total_transactions": 0,
            "fraud_percentage": 0.0,
            "fraud_count": 0,
            "vpn_usage": {"count": 0, "percentage": 0.0, "fraud_rate": 0.0},
            "ip_traffic": {"top_ips": [], "heavy_traffic_count": 0},
            "nighttime_attacks": {"count": 0, "fraud_rate": 0.0},
            "risk_distribution": {"low": 0, "medium": 0, "high": 0},
            "geographic_risks": [],
        }

    all_txns = base_query.all()

    # Fraud statistics
    fraud_count = sum(1 for t in all_txns if t.flagged)
    fraud_percentage = (fraud_count / total_txns * 100) if total_txns > 0 else 0.0

    # VPN usage
    vpn_txns = [t for t in all_txns if t.is_vpn]
    vpn_count = len(vpn_txns)
    vpn_fraud_count = sum(1 for t in vpn_txns if t.flagged)
    vpn_fraud_rate = (vpn_fraud_count / vpn_count) if vpn_count > 0 else 0.0

    # IP traffic density — use raw Python aggregation (works for any time range)
    from collections import Counter
    ip_counter = Counter(t.ip_address for t in all_txns)
    # Show all IPs with at least 2 transactions, up to 10
    threshold = 2 if total_txns < 20 else 5
    top_ip_pairs = [(ip, cnt) for ip, cnt in ip_counter.most_common(10) if cnt >= threshold]

    top_ips = [
        {
            "ip_address": ip,
            "count": count,
            "risk_level": "Critical" if count >= 50 else "High" if count >= 20 else "Medium" if count >= 10 else "Low",
        }
        for ip, count in top_ip_pairs
    ]

    heavy_traffic_count = sum(1 for _, count in top_ip_pairs if count >= 20)

    # Nighttime attacks (22:00 - 06:00)
    nighttime_txns = [
        t for t in all_txns
        if t.timestamp and (t.timestamp.hour >= 22 or t.timestamp.hour < 6)
    ]
    nighttime_count = len(nighttime_txns)
    nighttime_fraud_count = sum(1 for t in nighttime_txns if t.flagged)
    nighttime_fraud_rate = (nighttime_fraud_count / nighttime_count) if nighttime_count > 0 else 0.0

    # Risk distribution
    risk_distribution = {"low": 0, "medium": 0, "high": 0}
    for t in all_txns:
        key = (t.risk_level or "Low").lower()
        if key in risk_distribution:
            risk_distribution[key] += 1

    # Geographic risks (by country_code if available)
    from collections import defaultdict
    geo_data: dict[str, list] = defaultdict(list)
    for t in all_txns:
        if t.country_code:
            geo_data[t.country_code].append(t.risk_score or 0)

    geographic_risks = [
        {
            "country_code": country,
            "transaction_count": len(scores),
            "avg_risk_score": round(sum(scores) / len(scores), 2),
        }
        for country, scores in sorted(geo_data.items(), key=lambda x: sum(x[1]) / len(x[1]), reverse=True)[:5]
    ]

    return {
        "date": date_label,
        "total_transactions": total_txns,
        "fraud_percentage": round(fraud_percentage, 2),
        "fraud_count": fraud_count,
        "vpn_usage": {
            "count": vpn_count,
            "percentage": round((vpn_count / total_txns * 100) if total_txns > 0 else 0.0, 2),
            "fraud_rate": round(vpn_fraud_rate * 100, 2),
        },
        "ip_traffic": {
            "top_ips": top_ips,
            "heavy_traffic_count": heavy_traffic_count,
        },
        "nighttime_attacks": {
            "count": nighttime_count,
            "fraud_rate": round(nighttime_fraud_rate * 100, 2),
        },
        "risk_distribution": risk_distribution,
        "geographic_risks": geographic_risks,
    }


def get_weekly_trends(db: Session, days: int = 7) -> list[dict]:
    """Get daily insights for the last N days, returned oldest→newest."""
    trends = []
    for i in range(days - 1, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        insights = get_daily_insights(db, date)
        # Attach a simple short date label always
        insights["date"] = (datetime.utcnow() - timedelta(days=i)).strftime("%b %d")
        trends.append(insights)
    return trends
