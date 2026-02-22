const API_BASE_URL = 'http://localhost:8000';
const API_KEY = 'fraudshield-dev-key-2024';

/**
 * API service for communicating with the backend
 */
export const api = {
  /**
   * Predict fraud for a transaction
   */
  async predictFraud(transactionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        let errorMessage = 'Prediction failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Re-throw with a more user-friendly message if it's a network error
      if (error.message.includes('fetch')) {
        throw new Error('Cannot connect to the API. Make sure the backend server is running on http://localhost:8000');
      }
      throw error;
    }
  },

  /**
   * Train the ML model
   */
  async trainModel() {
    try {
      const response = await fetch(`${API_BASE_URL}/train-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Training failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Re-throw with a more user-friendly message if it's a network error
      if (error.message.includes('fetch')) {
        throw new Error('Cannot connect to the API. Make sure the backend server is running on http://localhost:8000');
      }
      throw error;
    }
  },

  /**
   * Get fraud statistics
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/stats`, {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all transactions
   */
  async getTransactions(skip = 0, limit = 100) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/transactions?skip=${skip}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

/**
 * Generate random transaction data for demo
 */
export function generateRandomTransaction() {
  const locations = [
    'Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Bangalore',
    'Kolkata', 'Pune', 'Jaipur', 'New York', 'London',
    'Singapore', 'Dubai', 'Tokyo', 'Unknown'
  ];
  
  const deviceTypes = ['Mobile', 'Desktop', 'Tablet', 'POS', 'ATM'];
  
  const merchants = Array.from({ length: 200 }, (_, i) => `M${i + 1}`);
  
  // Generate random amount (sometimes high for fraud simulation)
  const isHighAmount = Math.random() < 0.3; // 30% chance of high amount
  const amount = isHighAmount
    ? Math.floor(Math.random() * 50000) + 5000 // $5000-$55000
    : Math.floor(Math.random() * 5000) + 10; // $10-$5000
  
  // Generate transaction time (epoch seconds)
  const now = Math.floor(Date.now() / 1000);
  const transactionTime = now - Math.floor(Math.random() * 86400); // Within last 24 hours
  
  return {
    amount: parseFloat(amount.toFixed(2)),
    transaction_time: transactionTime,
    location: locations[Math.floor(Math.random() * locations.length)],
    device_type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
    merchant_id: merchants[Math.floor(Math.random() * merchants.length)],
  };
}
