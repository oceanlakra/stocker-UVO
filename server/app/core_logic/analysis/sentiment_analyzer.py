import pandas as pd
from typing import List, Dict, Any
from .reddit_scraper import RedditScraper
from .text_processor import FinbertTextProcessor
from ...config import settings # For default days_back

def analyze_reddit_sentiment(
    subreddits: List[str], 
    keywords: List[str], 
    days_back: int = None # Allow overriding default
) -> pd.DataFrame:
    """
    Scrapes Reddit discussions, cleans text, and performs sentiment analysis.
    Returns a DataFrame with original posts and sentiment scores.
    """
    if days_back is None:
        days_back = settings.DEFAULT_DAYS_BACK_REDDIT

    scraper = RedditScraper() # Initializes with credentials from settings
    processor = FinbertTextProcessor() # Initializes FinBERT if not already

    raw_posts_df = scraper.scrape_discussions(subreddits, keywords, days_back)

    if raw_posts_df.empty:
        return pd.DataFrame(columns=['id', 'title', 'body', 'cleaned_text', 'sentiment_score', 'created_utc', 'subreddit', 'url', 'score', 'num_comments'])


    # Ensure 'body' column exists and handle potential NaN/None values
    if 'body' not in raw_posts_df.columns:
        raw_posts_df['body'] = "" # Add empty string if body column is missing
    raw_posts_df['body'] = raw_posts_df['body'].fillna("") # Fill NaN with empty string

    raw_posts_df['cleaned_text'] = raw_posts_df['body'].apply(processor.clean_text)
    raw_posts_df['sentiment_score'] = raw_posts_df['cleaned_text'].apply(processor.get_sentiment_score)
    
    # Convert timestamp to datetime for easier use, but keep original UTC for consistency
    raw_posts_df['datetime_utc'] = pd.to_datetime(raw_posts_df['created_utc'], unit='s', utc=True)

    return raw_posts_df[['id', 'title', 'body', 'cleaned_text', 'sentiment_score', 'created_utc', 'datetime_utc', 'subreddit', 'url', 'score', 'num_comments']]