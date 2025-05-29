from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session # If you decide to save analysis results later
from typing import List, Dict
from ..schemas import analysis_schemas
from .. import schemas, crud, dependencies, config
from ..db.database import get_db
from ..core_logic.analysis import sentiment_analyzer # Orchestration function
import nltk
from ..crud import history_crud
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

router = APIRouter(
    prefix="/analysis",
    tags=["Reddit Sentiment Analysis"],
    dependencies=[Depends(dependencies.get_current_active_user)] # Protect all routes
)

@router.post("/reddit-sentiment", response_model=analysis_schemas.RedditSentimentOutput)
async def get_reddit_sentiment_analysis(
    analysis_input: schemas.analysis_schemas.RedditSentimentInput,
    db: Session = Depends(get_db), # For history logging
    current_user: schemas.user_schemas.User = Depends(dependencies.get_current_active_user)
):
    try:
        # Use provided days_back or default from settings if input is None
        days_to_check = analysis_input.days_back if analysis_input.days_back is not None else config.settings.DEFAULT_DAYS_BACK_REDDIT
        
        sentiment_df = sentiment_analyzer.analyze_reddit_sentiment(
            subreddits=analysis_input.subreddits,
            keywords=analysis_input.keywords,
            days_back=days_to_check
        )
        

        if sentiment_df.empty:
            avg_sentiment = None
            sentiment_by_sub = {}
            posts_output = []
        else:
            avg_sentiment = sentiment_df['sentiment_score'].mean() if not sentiment_df.empty else None
            sentiment_by_sub = sentiment_df.groupby('subreddit')['sentiment_score'].mean().to_dict() if not sentiment_df.empty else {}
            # Convert DataFrame rows to Pydantic models
            posts_output = [
                schemas.analysis_schemas.RedditPostSentiment(
                    cleaned_text_summary=row['cleaned_text'][:200] + '...' if len(row['cleaned_text']) > 200 else row['cleaned_text'], # Example summary
                    post_score=row['score'], # Ensure alias works or use direct mapping
                    **row.to_dict()
                ) for index, row in sentiment_df.iterrows()
            ]
            # Alternative if alias not working as expected:
            # posts_output = []
            # for index, row in sentiment_df.iterrows():
            #     post_data = row.to_dict()
            #     post_data['post_score'] = post_data.pop('score') # Manual rename
            #     posts_output.append(schemas.analysis_schemas.RedditPostSentiment(**post_data))


        api_output = schemas.analysis_schemas.RedditSentimentOutput(
            query_details=analysis_input,
            total_posts_found=len(sentiment_df),
            average_sentiment=avg_sentiment,
            sentiment_by_subreddit=sentiment_by_sub,
            posts=posts_output
        )

        # History Logging
        input_summary = analysis_input.model_dump()
        output_summary = {
            "total_posts": api_output.total_posts_found,
            "avg_sentiment": api_output.average_sentiment,
            "subreddits_analyzed_count": len(api_output.query_details.subreddits)
        }
        history_entry = schemas.history_schemas.HistoryEntryCreate(
            user_id=current_user.id,
            action_type="REDDIT_SENTIMENT_ANALYSIS",
            input_summary=input_summary,
            output_summary=output_summary
        )
        crud.history_crud.create_history_entry(db, entry=history_entry)

        return api_output

    except ConnectionError as ce: # Catch PRAW init errors
        raise HTTPException(status_code=503, detail=f"Reddit API connection error: {ce}")
    except ValueError as ve: # Catch config errors or validation errors from core logic
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Log the full error for server-side debugging
        print(f"Error during Reddit sentiment analysis: {e}") # Replace with proper logging
        # Consider logging traceback: import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")