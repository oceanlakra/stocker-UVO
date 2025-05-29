import re
import nltk
nltk.download('punkt_tab') #remove it after first run
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import logging # Use logging

# Setup logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO) # Configure as needed

# Download NLTK resources if not present (can be done during Docker build or app startup)
try:
    nltk.data.find('tokenizers/punkt')
except nltk.downloader.DownloadError:
    nltk.download('punkt', quiet=True)
try:
    nltk.data.find('corpora/stopwords')
except nltk.downloader.DownloadError:
    nltk.download('stopwords', quiet=True)


class FinbertTextProcessor: # Renamed for clarity
    _tokenizer = None
    _model = None
    _stop_words = None

    def __init__(self):
        if FinbertTextProcessor._tokenizer is None or FinbertTextProcessor._model is None:
            logger.info("Initializing FinBERT model and tokenizer...")
            try:
                FinbertTextProcessor._tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
                FinbertTextProcessor._model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
                FinbertTextProcessor._model.eval()  # Set to evaluation mode
                FinbertTextProcessor._stop_words = set(stopwords.words('english'))
                logger.info("FinBERT model and tokenizer initialized successfully.")
            except Exception as e:
                logger.error(f"Error initializing FinBERT models: {e}", exc_info=True)
                # Depending on how critical this is, you might raise an error or allow degraded functionality
                raise RuntimeError(f"Failed to initialize FinBERT: {e}")

    def clean_text(self, text: str) -> str:
        if not isinstance(text, str):
            text = str(text)
        
        text = text.lower()
        text = re.sub(r'[^a-zA-Z0-9$%.\s]', '', text) # Keep $ % . for financial context
        
        try:
            tokens = word_tokenize(text)
        except Exception as e:
            logger.warning(f"Tokenization error for text '{text[:50]}...': {e}")
            return text # Return original or minimally processed text on error
        
        if self._stop_words:
            tokens = [token for token in tokens if token not in self._stop_words]
        
        return ' '.join(tokens)

    def get_sentiment_score(self, text: str) -> float:
        if not self._model or not self._tokenizer:
            logger.error("FinBERT model/tokenizer not available for sentiment analysis.")
            return 0.0 # Or raise an error

        if not isinstance(text, str) or not text.strip():
            return 0.0
        
        try:
            inputs = self._tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            
            with torch.no_grad():
                outputs = self._model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            scores = predictions.cpu().numpy()[0] # [negative, neutral, positive]
            # Weighted score: (positive_prob * 1) + (neutral_prob * 0) + (negative_prob * -1)
            sentiment_score = (scores[2] * 1) + (scores[0] * -1)
            return float(sentiment_score)
            
        except Exception as e:
            logger.error(f"Error in sentiment analysis for text '{text[:50]}...': {e}", exc_info=True)
            return 0.0 # Default to neutral on error