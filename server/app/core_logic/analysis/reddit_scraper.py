import praw
import pandas as pd
from datetime import datetime, timedelta
from ...config import settings # Import app settings

class RedditScraper:
    def __init__(self):
        # Credentials are now taken from settings, not passed as args
        if not all([settings.REDDIT_CLIENT_ID, settings.REDDIT_CLIENT_SECRET, settings.REDDIT_USER_AGENT]):
            raise ValueError("Reddit API credentials not configured in settings.")
        
        try:
            self.reddit = praw.Reddit(
                client_id=settings.REDDIT_CLIENT_ID,
                client_secret=settings.REDDIT_CLIENT_SECRET,
                user_agent=settings.REDDIT_USER_AGENT
            )
            self.reddit.auth.scopes() # Test connection by trying to get scopes
        except Exception as e:
            # Log error appropriately in a real app
            print(f"Failed to initialize PRAW Reddit instance: {e}")
            raise ConnectionError(f"PRAW Reddit initialization failed: {e}")

    def scrape_discussions(self, subreddits: list[str], keywords: list[str], days_back: int = 30) -> pd.DataFrame:
        all_posts = []
        time_filter_epoch = (datetime.now() - timedelta(days=days_back)).timestamp()

        for subreddit_name in subreddits:
            try:
                subreddit = self.reddit.subreddit(subreddit_name)
                # Using time_filter='month' as an example, PRAW search time_filter might be limited.
                # For more precise date filtering, you might need to iterate and check post.created_utc
                for post in subreddit.search(f"({' OR '.join(keywords)})", sort='new', limit=None, time_filter='month'): # PRAW's limit=None can be slow
                    if post.created_utc > time_filter_epoch:
                        all_posts.append({
                            'id': post.id, # Good to have a unique ID
                            'title': post.title,
                            'body': post.selftext,
                            'score': post.score,
                            'num_comments': post.num_comments,
                            'created_utc': post.created_utc,
                            'url': post.permalink, # URL to the post
                            'subreddit': subreddit_name
                        })
            except Exception as e:
                print(f"Error scraping subreddit {subreddit_name}: {e}")
                # Optionally continue to next subreddit or re-raise
                continue
        
        if not all_posts:
            return pd.DataFrame() # Return empty DataFrame if no posts found
            
        return pd.DataFrame(all_posts)