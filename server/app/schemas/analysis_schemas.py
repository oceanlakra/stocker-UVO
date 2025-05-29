from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime # For timestamp in response

class RedditSentimentInput(BaseModel):
    subreddits: List[str] = Field(..., example=['stocks', 'wallstreetbets'])
    keywords: List[str] = Field(..., example=['SPY', 'market outlook'])
    days_back: Optional[int] = Field(default=None, ge=1, le=90, description="Number of days to look back for posts, uses default if None.")

class RedditPostSentiment(BaseModel):
    id: str
    title: str
    # body: str # Potentially large, consider omitting or truncating for API response
    cleaned_text_summary: Optional[str] = None # Maybe a snippet
    sentiment_score: float
    created_utc: float # Unix timestamp
    datetime_utc: datetime.datetime # Human-readable timestamp
    url: str
    subreddit: str
    post_score: int = Field(alias="score") # Use alias if DataFrame column is 'score'
    num_comments: int

    class Config:
        from_attributes = True
        populate_by_name = True # Allows using aliases like 'score'

class RedditSentimentOutput(BaseModel):
    query_details: RedditSentimentInput
    total_posts_found: int
    average_sentiment: Optional[float] = None
    sentiment_by_subreddit: Optional[Dict[str, float]] = None
    posts: List[RedditPostSentiment]