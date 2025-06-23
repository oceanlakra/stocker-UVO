// src/features/analysis/analysisService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface RedditSentimentInput {
  subreddits: string[];
  keywords: string[];
  days_back?: number;
}

export interface RedditPostSentiment {
  cleaned_text_summary: string;
  post_score: number;
  sentiment_score: number;
  subreddit: string;
  created_utc: string;
}

export interface RedditSentimentOutput {
  query_details: RedditSentimentInput;
  total_posts_found: number;
  average_sentiment: number | null;
  sentiment_by_subreddit: Record<string, number>;
  posts: RedditPostSentiment[];
}

// Remove token argument, handle token here (like Prediction service)
const getRedditSentimentAnalysis = async (
  input: RedditSentimentInput
): Promise<RedditSentimentOutput> => {
  const token = localStorage.getItem('token');
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
  const res = await axios.post(`${API_URL}/analysis/reddit-sentiment`, input, config);
  return res.data;
};

export default {
  getRedditSentimentAnalysis,
};
