// src/features/comparison/comparisonService.ts
import axiosInstance from '@/lib/axios'; // Your configured Axios instance
import { ComparisonOutput } from './comparisonSlice.ts'; // Import the output type

// Input type matching backend ComparisonInput schema
export interface ComparisonInputData {
  stock_symbol: string;
  is_indian_market: boolean;
  start_time?: string | null; // Optional because they have defaults
  end_time?: string | null;
  num_results?: number | null;
  similarity_threshold?: number | null;
}

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/comparison`;

// Find similar patterns
export const findSimilarPatterns = async (
  inputData: ComparisonInputData,
  token: string // Token passed explicitly for services, or rely on interceptor
): Promise<ComparisonOutput> => {
  const response = await axiosInstance.post<ComparisonOutput>(
    `${API_URL}/find-similar-patterns`,
    inputData,
    // Interceptor should handle token, but explicit for clarity if needed:
    // { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};