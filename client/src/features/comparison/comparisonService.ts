// src/features/comparison/comparisonService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// --- Type Definitions (matching backend schemas) ---

// Input for the API call, allowing for optional parameters
export interface ComparisonInput {
  stock_symbol: string;
  start_time?: string;       // e.g., "09:30"
  end_time?: string;         // e.g., "16:00"
  num_results?: number;
  similarity_threshold?: number;
}

// A single data point for the intraday charts
// FIX: Renamed and updated to handle full OHLC data for candlestick charts.
export interface CandlestickDataPoint {
  time: string;  // e.g., "09:30:00"
  open: number;
  high: number;
  low: number;
  close: number;
}

// A single historical pattern that matches the query
export interface HistoricalPattern {
  stock_symbol: string;
  date: string;
  similarity_score: number;
  data: CandlestickDataPoint[]; // FIX: Use the new CandlestickDataPoint type
}

// The final structure of the successful API response
export interface ComparisonResponse {
  query_stock_symbol: string;
  query_date: string;
  query_time_window: string;
  similar_historical_patterns: HistoricalPattern[];
  message?: string; // Optional message from the backend
}

// --- API Function ---

/**
 * Fetches similar historical stock patterns from the backend.
 * @param input The comparison parameters from the user.
 * @param token The user's JWT for authentication.
 * @returns A promise that resolves to the comparison results.
 */
const findSimilarPatterns = async (
  input: ComparisonInput,
  token: string
): Promise<ComparisonResponse> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(
    `${API_URL}/comparison/find-similar-patterns`,
    input,
    config
  );

  return response.data;
};

const comparisonService = {
  findSimilarPatterns,
};

export default comparisonService;