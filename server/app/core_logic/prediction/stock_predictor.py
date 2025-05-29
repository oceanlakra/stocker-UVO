# # backend/app/core_logic/prediction/stock_predictor.py
# import pandas as pd
# import numpy as np
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import classification_report, confusion_matrix
# import torch
# import torch.nn as nn
# import torch.optim as optim
# from torch.utils.data import DataLoader

# from ..models.sentiment_lstm import SentimentLSTM # Model definition
# from ..models.stock_dataset import StockDataset # Dataset class
# from . import feature_engineering # Feature engineering functions
# from ...config import settings # For default params

# class StockPredictor:
#     def __init__(self, model_path: str = None): # model_path for loading pre-trained
#         self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
#         self.model: SentimentLSTM = None
#         self.scaler = None # Will be fitted during training or loaded
#         self.model_path = model_path # Path to save/load model
#         self.input_feature_size = None # Determined during training

#         if model_path and os.path.exists(model_path): # os needs to be imported
#             self.load_trained_model(model_path) # We'll define this later

#     def train_and_evaluate(
#         self, 
#         features_df: pd.DataFrame, # DataFrame from feature_engineering.prepare_prediction_features
#         epochs: int = None, 
#         batch_size: int = None, 
#         learning_rate: float = 0.001,
#         sequence_length: int = None,
#         test_size: float = 0.2
#     ) -> dict:
#         """
#         Trains the LSTM model and evaluates it.
#         features_df must contain a 'target' column and feature columns.
#         """
#         _epochs = epochs or settings.DEFAULT_LSTM_EPOCHS
#         _batch_size = batch_size or settings.DEFAULT_LSTM_BATCH_SIZE
#         _sequence_length = sequence_length or settings.DEFAULT_LSTM_SEQUENCE_LENGTH

#         if 'target' not in features_df.columns:
#             raise ValueError("'target' column missing from features_df.")

#         feature_cols = [col for col in features_df.columns if col != 'target']
#         if not feature_cols:
#             raise ValueError("No feature columns found in features_df (excluding 'target').")

#         X_data = features_df[feature_cols]
#         y_data = features_df['target']

#         # Scale features
#         X_scaled_df, self.scaler = feature_engineering.scale_features(X_data) # Save the scaler
#         self.input_feature_size = X_scaled_df.shape[1] # Number of features

#         # Create sequences
#         X_seq, y_seq = feature_engineering.create_lstm_sequences(X_scaled_df, y_data, _sequence_length)

#         if len(X_seq) == 0:
#             raise ValueError("Not enough data to create sequences. Try a longer data period or shorter sequence length.")

#         # Split data
#         X_train, X_test, y_train, y_test = train_test_split(X_seq, y_seq, test_size=test_size, random_state=42, shuffle=False) # Time series usually not shuffled

#         train_dataset = StockDataset(X_train, y_train)
#         test_dataset = StockDataset(X_test, y_test)
        
#         train_loader = DataLoader(train_dataset, batch_size=_batch_size, shuffle=True) # Shuffle training batches
#         test_loader = DataLoader(test_dataset, batch_size=_batch_size, shuffle=False)
        
#         self.model = SentimentLSTM(
#             input_size=self.input_feature_size, # Use determined feature size
#             hidden_size=settings.DEFAULT_LSTM_HIDDEN_SIZE, # Add to config
#             num_layers=settings.DEFAULT_LSTM_NUM_LAYERS  # Add to config
#         ).to(self.device)
        
#         criterion = nn.BCELoss()
#         optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
        
#         print(f"Starting training for {_epochs} epochs on device: {self.device}")
#         for epoch in range(_epochs):
#             self.model.train()
#             total_loss = 0
#             for batch_X, batch_y in train_loader:
#                 batch_X, batch_y = batch_X.to(self.device), batch_y.to(self.device).unsqueeze(1)
                
#                 outputs = self.model(batch_X)
#                 loss = criterion(outputs, batch_y)
                
#                 optimizer.zero_grad()
#                 loss.backward()
#                 optimizer.step()
#                 total_loss += loss.item()
            
#             if (epoch + 1) % 10 == 0 or epoch == 0 or epoch == _epochs -1 :
#                 print(f'Epoch [{epoch+1}/{_epochs}], Loss: {total_loss/len(train_loader):.4f}')
        
#         # Evaluation
#         self.model.eval()
#         y_pred_probs = []
#         y_true_list = []
#         with torch.no_grad():
#             for batch_X, batch_y in test_loader:
#                 batch_X = batch_X.to(self.device)
#                 outputs = self.model(batch_X)
#                 y_pred_probs.extend(outputs.cpu().squeeze().tolist())
#                 y_true_list.extend(batch_y.cpu().tolist())
        
#         y_pred_classes = (np.array(y_pred_probs) > 0.5).astype(int)
        
#         # Handle cases where a class might be missing in y_pred_classes for classification_report
#         unique_true = np.unique(y_true_list)
#         unique_pred = np.unique(y_pred_classes)
#         labels_present = np.union1d(unique_true, unique_pred)
        
#         if len(labels_present) < 2: # Only one class predicted or present
#              report = "Classification report cannot be generated with only one class present in predictions or true labels."
#              conf_matrix = confusion_matrix(y_true_list, y_pred_classes, labels=[0,1] if len(labels_present)>0 else labels_present) # Ensure labels are passed
#         else:
#              report = classification_report(y_true_list, y_pred_classes, labels=labels_present, zero_division=0)
#              conf_matrix = confusion_matrix(y_true_list, y_pred_classes, labels=labels_present)


#         return {
#             'classification_report': report,
#             'confusion_matrix': conf_matrix.tolist(), # Convert numpy array to list for JSON
#             'y_true': y_true_list,
#             'y_pred_probabilities': y_pred_probs,
#             'trained_feature_columns': feature_cols # Store for prediction consistency
#         }

#     def predict_next_day(self, latest_features_df: pd.DataFrame, sequence_length: int = None) -> float:
#         """
#         Predicts for the next day using the trained model.
#         latest_features_df should contain the most recent 'sequence_length' days of feature data.
#         It must NOT contain the 'target' column.
#         """
#         if self.model is None or self.scaler is None or self.input_feature_size is None:
#             raise RuntimeError("Model is not trained or loaded. Train or load a model first.")

#         _sequence_length = sequence_length or settings.DEFAULT_LSTM_SEQUENCE_LENGTH

#         if len(latest_features_df) < _sequence_length:
#             raise ValueError(f"Need at least {_sequence_length} days of feature data for prediction, got {len(latest_features_df)}")

#         # Ensure columns are in the same order as training
#         # And scale using the FITTED scaler
#         # The input `latest_features_df` should have the raw feature values.
        
#         # Take the last `_sequence_length` rows for the input sequence
#         recent_data_for_scaling = latest_features_df.iloc[-_sequence_length:]
        
#         # Scale the features
#         # Important: Use the scaler that was FIT during training
#         scaled_values = self.scaler.transform(recent_data_for_scaling)
        
#         # Ensure the number of features matches
#         if scaled_values.shape[1] != self.input_feature_size:
#              raise ValueError(f"Input feature size mismatch. Expected {self.input_feature_size}, got {scaled_values.shape[1]}")


#         input_sequence_np = np.array([scaled_values]) # Shape: (1, sequence_length, num_features)
#         input_tensor = torch.FloatTensor(input_sequence_np).to(self.device)

#         self.model.eval()
#         with torch.no_grad():
#             prediction_prob = self.model(input_tensor).item()
        
#         return prediction_prob # Returns the probability of positive movement

#     # TODO: Implement save_trained_model and load_trained_model methods
#     # These would save self.model.state_dict(), self.scaler, self.input_feature_size,
#     # and the list of feature columns used for training.
#     # Example:
#     # def save_trained_model(self, path: str):
#     #     if self.model and self.scaler and self.input_feature_size:
#     #         torch.save({
#     #             'model_state_dict': self.model.state_dict(),
#     #             'scaler': self.scaler,
#     #             'input_feature_size': self.input_feature_size,
#     #             'feature_columns': self.trained_feature_columns # Need to store this from training
#     #         }, path)
#     #         print(f"Model saved to {path}")
#     #     else:
#     #         raise RuntimeError("Model not trained or essential components missing.")

#     # def load_trained_model(self, path: str):
#     #     checkpoint = torch.load(path, map_location=self.device)
#     #     self.input_feature_size = checkpoint['input_feature_size']
#     #     self.trained_feature_columns = checkpoint['feature_columns']
        
#     #     self.model = SentimentLSTM(
#     #         input_size=self.input_feature_size,
#     #         hidden_size=settings.DEFAULT_LSTM_HIDDEN_SIZE,
#     #         num_layers=settings.DEFAULT_LSTM_NUM_LAYERS
#     #     ).to(self.device)
#     #     self.model.load_state_dict(checkpoint['model_state_dict'])
#     #     self.scaler = checkpoint['scaler']
#     #     self.model.eval()
#     #     print(f"Model loaded from {path}")

# # Need to add DEFAULT_LSTM_HIDDEN_SIZE and DEFAULT_LSTM_NUM_LAYERS to config.py and .env
# # Example in .env:
# # DEFAULT_LSTM_HIDDEN_SIZE=128
# # DEFAULT_LSTM_NUM_LAYERS=3


# backend/app/core_logic/prediction/stock_predictor.py
# ... (imports, SentimentLSTM, StockDataset - these can stay in their respective model files)
# ... (MarketDataFetcher, feature_engineering functions)
import os # for model_path check
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split # Only if we do a train/test split within this process
from sklearn.metrics import classification_report, confusion_matrix
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from ..models.sentiment_lstm import SentimentLSTM
from ..models.stock_dataset import StockDataset
from . import feature_engineering
from ...config import settings

class StockPredictorPrototype: # Renamed for clarity of its purpose
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model: Optional[SentimentLSTM] = None
        self.scaler = None
        self.trained_feature_columns: Optional[List[str]] = None
        self.input_feature_size: Optional[int] = None

    def train_and_predict_next_step(
        self,
        features_df: pd.DataFrame, # Historical features including 'target'
        epochs: int,
        batch_size: int,
        sequence_length: int,
        learning_rate: float,
        hidden_size: int,
        num_layers: int
    ) -> float: # Returns probability for the next step
        """
        Trains a model on the provided historical features_df and uses the
        very last sequence from this data to predict the step immediately following it.
        """
        if 'target' not in features_df.columns:
            raise ValueError("'target' column missing from features_df.")

        self.trained_feature_columns = [col for col in features_df.columns if col != 'target']
        if not self.trained_feature_columns:
            raise ValueError("No feature columns found.")

        X_data = features_df[self.trained_feature_columns]
        y_data = features_df['target']

        X_scaled_df, self.scaler = feature_engineering.scale_features(X_data)
        self.input_feature_size = X_scaled_df.shape[1]

        # For this prototype, we train on almost all data to predict the next step.
        # A small test set can still be useful for a sanity check during this ad-hoc training.
        # Or, we can train on ALL of X_seq, y_seq and then form the *very last* sequence for prediction.
        
        X_seq, y_seq = feature_engineering.create_lstm_sequences(X_scaled_df, y_data, sequence_length)

        if len(X_seq) < 2: # Need at least one for training, one for forming prediction input
            raise ValueError("Not enough data to create at least two sequences after processing. Increase data_history_days.")

        # Use all available sequences for training in this prototype predict flow
        train_dataset = StockDataset(X_seq, y_seq)
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

        self.model = SentimentLSTM(
            input_size=self.input_feature_size,
            hidden_size=hidden_size,
            num_layers=num_layers
        ).to(self.device)

        criterion = nn.BCELoss()
        optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)

        print(f"Prototype: Training model for {epochs} epochs to predict next step...")
        for epoch in range(epochs):
            self.model.train()
            for batch_X, batch_y in train_loader:
                batch_X, batch_y = batch_X.to(self.device), batch_y.to(self.device).unsqueeze(1)
                outputs = self.model(batch_X)
                loss = criterion(outputs, batch_y)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
            if (epoch + 1) % (epochs // 2 if epochs > 1 else 1) == 0 or epoch == 0 : # Log a few times
                 print(f"Epoch [{epoch+1}/{epochs}] completed.")
        
        # Now, create the input for predicting the *actual* next step
        # We need the last `sequence_length` worth of SCALED features from the *original* X_scaled_df
        
        if len(X_scaled_df) < sequence_length:
            raise ValueError(f"Not enough historical scaled data ({len(X_scaled_df)}) to form a prediction sequence of length {sequence_length}.")

        last_sequence_for_prediction_np = X_scaled_df.iloc[-sequence_length:].values
        last_sequence_tensor = torch.FloatTensor([last_sequence_for_prediction_np]).to(self.device) # Batch of 1

        self.model.eval()
        with torch.no_grad():
            prediction_prob = self.model(last_sequence_tensor).item()
        
        print(f"Prototype: Prediction probability for next step: {prediction_prob}")
        return prediction_prob