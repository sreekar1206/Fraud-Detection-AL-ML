const API = 'http://localhost:8000';

/**
 * Submit a transaction for fraud analysis.
 * @param {{ name: string, amount: number, device: string }} data
 * @returns {Promise<object>} TransactionOut
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
 * @returns {Promise<object[]>}
 */
export async function getHistory() {
  const res = await fetch(`${API}/api/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}
