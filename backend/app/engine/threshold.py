"""
Dynamic / Bayesian Threshold Engine.

Instead of a hard 0.5 cutoff, the fraud threshold shifts based on:
  - ``account_age_days`` — newer accounts get stricter scrutiny
  - ``trust_score``      — long-term good behaviour raises the bar

Uses a sigmoid-inspired curve:
  - Brand-new account (0 days, trust 0.0)  → threshold ≈ 0.25
  - 30-day account   (trust 0.3)           → threshold ≈ 0.35
  - 1-year account   (trust 0.7)           → threshold ≈ 0.55
  - 10-year veteran  (trust 1.0)           → threshold ≈ 0.75
"""
from __future__ import annotations

import math


# Tuneable parameters
BASE_THRESHOLD = 0.25          # minimum (strictest)
MAX_THRESHOLD = 0.75           # maximum (most lenient)
AGE_MIDPOINT_DAYS = 180        # sigmoid inflection point
AGE_STEEPNESS = 0.02           # how quickly age raises threshold
TRUST_WEIGHT = 0.40            # how much trust_score matters vs age


def compute_threshold(
    account_age_days: int = 0,
    trust_score: float = 0.5,
) -> float:
    """
    Return a dynamic fraud-decision threshold in [BASE, MAX].

    If ``risk_score >= threshold`` → flag as fraud.

    Args:
        account_age_days:  Days since account creation (0 = brand new).
        trust_score:       Normalised reputation score (0.0 – 1.0).
    """
    trust_score = max(0.0, min(1.0, trust_score))

    # Sigmoid contribution from account age
    age_factor = 1.0 / (1.0 + math.exp(-AGE_STEEPNESS * (account_age_days - AGE_MIDPOINT_DAYS)))

    # Blend age factor with trust score
    combined = (1.0 - TRUST_WEIGHT) * age_factor + TRUST_WEIGHT * trust_score

    threshold = BASE_THRESHOLD + combined * (MAX_THRESHOLD - BASE_THRESHOLD)
    return round(threshold, 4)


def apply_threshold(risk_score_pct: float, threshold: float) -> dict:
    """
    Compare a 0-100 risk score against the dynamic threshold.

    Returns dict with: ``flagged`` (bool), ``margin``, ``threshold_used``.
    """
    risk_norm = risk_score_pct / 100.0
    flagged = risk_norm >= threshold
    margin = round(risk_norm - threshold, 4)

    return {
        "flagged": flagged,
        "margin": margin,
        "threshold_used": threshold,
    }
