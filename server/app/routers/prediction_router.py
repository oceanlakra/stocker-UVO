# # backend/app/routers/prediction_router.py
# from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
# from sqlalchemy.orm import Session
# import pandas as pd
# import time # For timing training
# import datetime # For timestamps

# from .. import schemas, crud, dependencies, config
# from ..db.database import get_db
# # Core logic imports
# from ..core_logic.analysis import sentiment_analyzer # For sentiment data
# from ..core_logic.prediction import market_data_fetcher, feature_engineering, stock_predictor

# router = APIRouter(
#     prefix="/predict",
#     tags=["Stock Prediction"],
#     dependencies=[Depends(dependencies.get_current_active_user)] # Protect all routes
# )

# # Global instance of StockPredictor (could be managed with lifespan events for loading pre-trained)
# # For now, we create it on demand. If you implement model loading, this might change.
# # This is a simplification. In a production app, model loading/management is more complex.
# # A better approach for pre-trained models: load once at app startup.
# # For on-the-fly training, this is okay for a first pass.
# # Let's assume we train a model per request for now, or use a shared instance if a model exists.
# # One way to handle a shared model instance:
# # predictor_instance: Optional[stock_predictor.StockPredictor] = None

# # def get_predictor_instance():
# #    global predictor_instance
# #    if predictor_instance is None:
# #        # Here you would load a default pre-trained model if it exists
# #        # predictor_instance = stock_predictor.StockPredictor(model_path="path/to/default_model.pt")
# #        # For now, let's just create a new one. The API will require training first.
# #        predictor_instance = stock_predictor.StockPredictor()
# #    return predictor_instance

# # For simplicity in this step, let's instantiate StockPredictor within the endpoint.
# # This means any "trained" model is only for the scope of that request unless we save/load.


# @router.post("/train-model", response_model=schemas.prediction_schemas.ModelTrainOutput)
# async def train_stock_prediction_model(
#     train_input: schemas.prediction_schemas.ModelTrainInput,
#     background_tasks: BackgroundTasks, # For potentially long training
#     db: Session = Depends(get_db),
#     current_user: schemas.user_schemas.User = Depends(dependencies.get_current_active_user)
# ):
#     """
#     Trains a stock prediction model. This can be a long-running task.
#     (Currently runs synchronously for simplicity, background_tasks is a placeholder for future enhancement)
#     """
#     start_time = time.time()
#     process_start_datetime = datetime.datetime.now(datetime.timezone.utc)

#     target_symbol = train_input.stock_symbol or config.settings.DEFAULT_STOCK_SYMBOL
#     reddit_keywords = train_input.reddit_keywords or [target_symbol]
    
#     try:
#         # 1. Fetch sentiment data
#         print(f"Fetching sentiment data for {target_symbol}...")
#         sentiment_df = sentiment_analyzer.analyze_reddit_sentiment(
#             subreddits=train_input.reddit_subreddits,
#             keywords=reddit_keywords,
#             days_back=train_input.reddit_days_back or config.settings.DEFAULT_DAYS_BACK_REDDIT
#         )
#         print(f"Sentiment data fetched. Shape: {sentiment_df.shape}")

#         # 2. Fetch market data
#         print(f"Fetching market data for {target_symbol}...")
#         md_fetcher = market_data_fetcher.MarketDataFetcher()
#         market_df = md_fetcher.get_stock_data(
#             symbol=target_symbol,
#             # Pass None to use defaults in get_stock_data for date ranges
#             start_date_str=None, # Or calculate based on market_data_days_back
#             end_date_str=None
#         )
#         print(f"Market data fetched. Shape: {market_df.shape}")

#         # 3. Prepare features
#         print("Preparing features...")
#         features_with_target_df = feature_engineering.prepare_prediction_features(
#             sentiment_df=sentiment_df,
#             market_df=market_df
#         )
#         if features_with_target_df.empty or 'target' not in features_with_target_df.columns:
#              raise ValueError("Feature preparation resulted in empty data or no target column.")
#         print(f"Features prepared. Shape: {features_with_target_df.shape}")

#         # 4. Train model
#         print("Initializing predictor and training model...")
#         predictor = stock_predictor.StockPredictor() # New instance for each training run for now
        
#         train_results = predictor.train_and_evaluate(
#             features_df=features_with_target_df,
#             epochs=train_input.epochs, # Will use defaults from settings if None
#             batch_size=train_input.batch_size,
#             learning_rate=train_input.learning_rate or 0.001, # Provide a default if not in settings
#             sequence_length=train_input.sequence_length,
#             test_size=train_input.test_size
#         )
#         print("Model training complete.")

#         # TODO: Implement model saving logic within StockPredictor or here
#         # model_save_path = f"trained_models/{target_symbol}_lstm_{int(start_time)}.pt"
#         # predictor.save_trained_model(model_save_path)

#         end_time = time.time()
#         duration = end_time - start_time

#         api_output = schemas.prediction_schemas.ModelTrainOutput(
#             stock_symbol=target_symbol,
#             training_start_time=process_start_datetime,
#             training_duration_seconds=duration,
#             classification_report=train_results['classification_report'],
#             confusion_matrix=train_results['confusion_matrix'],
#             feature_columns_used=train_results.get('trained_feature_columns', []) # Get from results
#             # model_save_path=model_save_path
#         )

#         # History Logging
#         input_summary = train_input.model_dump(exclude_none=True)
#         output_summary = {
#             "stock_symbol": api_output.stock_symbol,
#             "duration_seconds": api_output.training_duration_seconds,
#             "message": "Training completed." 
#             # Avoid putting full classification report in history summary unless truncated
#         }
#         history_entry = schemas.history_schemas.HistoryEntryCreate(
#             user_id=current_user.id,
#             action_type="MODEL_TRAINING",
#             input_summary=input_summary,
#             output_summary=output_summary
#         )
#         crud.history_crud.create_history_entry(db, entry=history_entry)

#         return api_output

#     except ValueError as ve:
#         raise HTTPException(status_code=400, detail=f"Input or data error: {str(ve)}")
#     except Exception as e:
#         import traceback
#         traceback.print_exc() # Print full traceback to server console for debugging
#         raise HTTPException(status_code=500, detail=f"An error occurred during model training: {str(e)}")


# # --- Prediction Endpoint (Requires a Pre-trained Model) ---
# # For this to work, you need a mechanism to load a trained model.
# # The StockPredictor class needs to be instantiated with a loaded model,
# # or a global/shared instance needs to be managed.

# # Global predictor instance, loaded at startup (conceptual)
# # This should ideally be done in main.py with lifespan events
# # For now, we'll simulate or require training first.
# # Let's assume for now we don't have a persistent model loaded at startup.
# # The user would have to call /train-model first for a symbol.
# # This is NOT ideal for production but helps for initial dev.
# # A better approach is to have a default model or manage model artifacts.

# # This is a simplified placeholder for predict. It needs a way to access a TRAINED model.
# # Option 1: Load from file if path is known (e.g., from a previous training call)
# # Option 2: If training happens in the same session/instance (as in the /train-model endpoint above),
# #           we'd need to store that 'predictor' instance. This is tricky with stateless HTTP requests.
# # Let's defer the full /predict endpoint until model persistence is clearer.
# # For now, a conceptual placeholder:

# @router.post("/stock-forecast", response_model=schemas.prediction_schemas.StockPredictOutput)
# async def get_stock_forecast(
#     predict_input: schemas.prediction_schemas.StockPredictInput,
#     db: Session = Depends(get_db),
#     current_user: schemas.user_schemas.User = Depends(dependencies.get_current_active_user)
# ):
#     """
#     Predicts stock movement. 
#     NOTE: This endpoint currently requires a model to be trained implicitly or loaded.
#     For a robust implementation, model loading/management needs to be in place.
#     This is a conceptual placeholder.
#     """
#     raise HTTPException(status_code=501, detail="Prediction endpoint not fully implemented. Model loading/management required.")

#     # Conceptual flow if a model was loaded or trained in this session:
#     # target_symbol = predict_input.stock_symbol or config.settings.DEFAULT_STOCK_SYMBOL
#     #
#     # 1. Get latest sentiment data (similar to training)
#     # sentiment_df = sentiment_analyzer.analyze_reddit_sentiment(...)
#     #
#     # 2. Get latest market data (enough for sequence_length)
#     # md_fetcher = market_data_fetcher.MarketDataFetcher()
#     # market_df = md_fetcher.get_stock_data(...)
#     #
#     # 3. Prepare features for the LATEST days needed for one sequence
#     # recent_features_df = feature_engineering.prepare_prediction_features(sentiment_df, market_df)
#     # This prepare_prediction_features would need adjustment to not create 'target'
#     # and only return the feature columns in the correct order.
#     # OR, you pass the full historical feature_df and StockPredictor internally extracts the last sequence.
#     #
#     # For prediction, you need the raw feature values for the last `sequence_length` days.
#     # Example: if sequence_length is 10, you need 10 rows of features.
#     # feature_cols_for_prediction = [...] # Must match columns used in training
#     # latest_raw_features = recent_features_df[feature_cols_for_prediction].tail(predict_input.sequence_length or config.settings.DEFAULT_LSTM_SEQUENCE_LENGTH)

#     # 4. Load or get the trained predictor instance
#     # predictor = get_predictor_instance_for_symbol(target_symbol) # This function needs to exist
#     # if not predictor.model:
#     #    raise HTTPException(status_code=404, detail=f"No trained model found for {target_symbol}. Please train a model first.")
#     #
#     # prediction_prob = predictor.predict_next_day(latest_raw_features)
#     #
#     # prediction_label = "Likely Up" if prediction_prob > 0.55 else ("Likely Down" if prediction_prob < 0.45 else "Neutral")
#     #
#     # api_output = schemas.prediction_schemas.StockPredictOutput(
#     #     stock_symbol=target_symbol,
#     #     prediction_timestamp=datetime.datetime.now(datetime.timezone.utc),
#     #     probability_positive_movement=prediction_prob,
#     #     prediction_label=prediction_label
#     # )
#     #
#     # History Logging
#     # ...
#     #
#     # return api_output


# backend/app/routers/prediction_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import time
import datetime

from .. import schemas, crud, dependencies, config
from ..db.database import get_db
from ..core_logic.analysis import sentiment_analyzer
from ..core_logic.prediction import market_data_fetcher, feature_engineering
from ..core_logic.prediction.stock_predictor import StockPredictorPrototype
from ..schemas import prediction_schemas # Use the prototype predictor

router = APIRouter(
    prefix="/predict",
    tags=["Stock Prediction (Prototype)"],
    dependencies=[Depends(dependencies.get_current_active_user)]
)

# Remove or comment out the /train-model endpoint for this prototype phase
# if the /stock-forecast endpoint will do its own ad-hoc training.
# Or, keep /train-model for more thorough offline training later. For now, let's focus on /stock-forecast.

@router.post("/stock-forecast", response_model=prediction_schemas.StockPredictOutput)
async def get_stock_forecast_prototype(
    predict_input: schemas.prediction_schemas.StockPredictInput,
    db: Session = Depends(get_db),
    current_user: schemas.user_schemas.User = Depends(dependencies.get_current_active_user)
):
    train_start_time = time.time()
    process_start_datetime = datetime.datetime.now(datetime.timezone.utc)

    effective_symbol = predict_input.stock_symbol or config.settings.DEFAULT_STOCK_SYMBOL
    effective_history_days = predict_input.data_history_days or config.settings.DEFAULT_DAYS_MARKET_DATA # This is for historical data
    
    # Use prototype-specific (faster) training params, allowing user override if provided
    effective_epochs = predict_input.epochs or config.settings.DEFAULT_LSTM_EPOCHS
    effective_sequence_length = predict_input.sequence_length or config.settings.DEFAULT_LSTM_SEQUENCE_LENGTH
    # Get other params from settings for simplicity in prototype
    effective_batch_size = config.settings.DEFAULT_LSTM_BATCH_SIZE
    effective_lr = config.settings.DEFAULT_PREDICTION_LR
    effective_hidden_size = config.settings.DEFAULT_LSTM_HIDDEN_SIZE
    effective_num_layers = config.settings.DEFAULT_LSTM_NUM_LAYERS

    # Determine reddit keywords
    if predict_input.reddit_keywords:
        effective_reddit_keywords = predict_input.reddit_keywords
    elif effective_symbol:
        effective_reddit_keywords = [effective_symbol]
    else:
        effective_reddit_keywords = [] # Or a default set of general keywords

    effective_reddit_subreddits = predict_input.reddit_subreddits or ["wallstreetbets", "stocks"]


    try:
        print(f"Forecast for {effective_symbol}: Fetching data for past {effective_history_days} days.")
        # 1. Fetch historical sentiment data
        sentiment_df = pd.DataFrame() # Default to empty
        if effective_reddit_keywords and effective_reddit_subreddits:
            sentiment_df = sentiment_analyzer.analyze_reddit_sentiment(
                subreddits=effective_reddit_subreddits,
                keywords=effective_reddit_keywords,
                days_back=effective_history_days # Use the same history length for sentiment
            )
        print(f"Sentiment data shape: {sentiment_df.shape}")

        # 2. Fetch historical market data
        md_fetcher = market_data_fetcher.MarketDataFetcher()
        end_dt_market = datetime.datetime.now(datetime.timezone.utc) # Fetch up to today
        start_dt_market = end_dt_market - datetime.timedelta(days=effective_history_days)
        print(f"\n=== Before Market Data Fetch ===")
        print(f"Effective symbol: {effective_symbol}")
        print(f"Effective history days: {effective_history_days}")
        print(f"Start date: {start_dt_market.date()}")
        print(f"End date: {end_dt_market.date()}")
        print(f"Timezone: {datetime.timezone.utc}")
        market_df = md_fetcher.get_stock_data(
            symbol=effective_symbol,
            start_date_str=start_dt_market.strftime('%Y-%m-%d'), # yfinance needs YYYY-MM-DD
            end_date_str=end_dt_market.strftime('%Y-%m-%d')
        )
        print(market_df)
        if market_df.empty:
            raise ValueError(f"No market data found for {effective_symbol} for the period.")
        print(f"Market data shape: {market_df.shape}. Last date: {market_df.index[-1]}")

        # 3. Prepare features (this creates the 'target' column based on historical data)
        features_with_target_df = feature_engineering.prepare_prediction_features(
            sentiment_df=sentiment_df,
            market_df=market_df,
            target_shift_days=1 # Predict 1 day ahead
        )
        if features_with_target_df.empty:
            raise ValueError("Feature preparation resulted in empty data. Try increasing data_history_days.")
        print(f"Features with target shape: {features_with_target_df.shape}")
        
        # 4. Train model on this historical data & predict next step
        predictor = StockPredictorPrototype()
        probability_positive = predictor.train_and_predict_next_step(
            features_df=features_with_target_df,
            epochs=effective_epochs,
            batch_size=effective_batch_size,
            sequence_length=effective_sequence_length,
            learning_rate=effective_lr,
            hidden_size=effective_hidden_size,
            num_layers=effective_num_layers
        )

        # Determine the date for which the prediction is made
        # This is typically the next business day after the last date in market_df
        last_market_date = market_df.index[-1].date()
        prediction_for_date = last_market_date + datetime.timedelta(days=1) # Simplistic, doesn't account for weekends/holidays
        # A better way: find next trading day, or just state "next trading day after X"

        prediction_label = "UP" if probability_positive > 0.55 else ("DOWN" if probability_positive < 0.45 else "NEUTRAL")
        
        train_end_time = time.time()
        training_duration = train_end_time - train_start_time

        api_output = schemas.prediction_schemas.StockPredictOutput(
            stock_symbol=effective_symbol,
            prediction_for_date=prediction_for_date,
            probability_positive_movement=probability_positive,
            prediction_label=prediction_label,
            model_training_duration_seconds=training_duration,
            data_used_for_training_period=f"{start_dt_market.strftime('%Y-%m-%d')} to {end_dt_market.strftime('%Y-%m-%d')}",
            message="Prediction generated after on-the-fly model training."
        )

        # History Logging
        input_summary = predict_input.model_dump(exclude_none=True)
        output_summary = {
            "stock_symbol": api_output.stock_symbol,
            "prediction_for_date": api_output.prediction_for_date.isoformat(),
            "probability_up": api_output.probability_positive_movement,
            "label": api_output.prediction_label,
            "training_duration": api_output.model_training_duration_seconds
        }
        history_entry = schemas.history_schemas.HistoryEntryCreate(
            user_id=current_user.id,
            action_type="STOCK_FORECAST_PROTOTYPE",
            input_summary=input_summary,
            output_summary=output_summary
        )
        crud.history_crud.create_history_entry(db, entry=history_entry)

        return api_output

    except ValueError as ve:
        # Log ve for server, return clean message
        print(f"ValueError in forecast: {ve}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Input or data error: {str(ve)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred during prediction: {str(e)}")