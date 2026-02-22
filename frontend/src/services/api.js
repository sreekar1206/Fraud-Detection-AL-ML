const API = 'http://localhost:8000';

/**
 * Submit a transaction for advanced fraud analysis.
 */
export async function submitTransaction(data) {
  const res = await fetch(`${API}/api/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch all past transactions (newest first).
 */
export async function getHistory() {
  const res = await fetch(`${API}/api/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

/**
 * Submit admin feedback on a transaction.
 */
export async function submitFeedback(transactionId, isFraud) {
  const res = await fetch(`${API}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: transactionId,
      is_fraud: isFraud,
    }),
  });
  if (!res.ok) throw new Error('Feedback failed');
  return res.json();
}

/**
 * Trigger champion-challenger retrain.
 */
export async function triggerRetrain() {
  const res = await fetch(`${API}/api/retrain`, { method: 'POST' });
  if (!res.ok) throw new Error('Retrain failed');
  return res.json();
}

/**
 * Get daily risk insights and analytics.
 */
export async function getDailyInsights(date = null) {
  const url = date 
    ? `${API}/api/insights/daily?date=${date}`
    : `${API}/api/insights/daily`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch daily insights');
  return res.json();
}

/**
 * Get weekly trends for the last N days.
 */
export async function getWeeklyTrends(days = 7) {
  const res = await fetch(`${API}/api/insights/weekly?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch weekly trends');
  return res.json();
}

/**
 * Get detailed forensics for a specific transaction.
 */
export async function getTransactionForensics(transactionId) {
  const res = await fetch(`${API}/api/forensics/${transactionId}`);
  if (!res.ok) throw new Error('Failed to fetch forensics');
  return res.json();
}

/**
 * Get all forensics data (or flagged only).
 */
export async function getAllForensics(limit = 100, flaggedOnly = false) {
  const url = `${API}/api/forensics?limit=${limit}&flagged_only=${flaggedOnly}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch forensics');
  return res.json();
}