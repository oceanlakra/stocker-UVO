import axios from 'axios';

// Use the environment variable for the API base URL, with a fallback for local dev
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// --- Type Definitions ---

// This interface defines the structure for a single data point in the prediction chart.
export interface PredictionDataPoint {
  date: string; // Using string for dates from JSON is safest
  predicted_price: number;
}

// This is the expected structure of the successful response from your backend's prediction endpoint.
export interface PredictionResponse {
  prediction: PredictionDataPoint[];
  ticker: string;
  last_actual_price: number;
}

// --- API Function ---

/**
 * Fetches a stock prediction from the backend API.
 * @param ticker The stock symbol to get a prediction for (e.g., "AAPL").
 * @param token The user's JWT for authentication.
 * @returns A promise that resolves to the prediction data.
 */
const getPrediction = async (
  ticker: string,
  token: string
): Promise<PredictionResponse> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // FIX 1: The endpoint path is `/predict/stock-forecast`
  // FIX 2: The request body should send `stock_symbol`, not `ticker`
  const response = await axios.post(
    `${API_URL}/predict/stock-forecast`, 
    { stock_symbol: ticker }, 
    config
  );

  return response.data;
};

const predictionService = {
  getPrediction,
};

export default predictionService;