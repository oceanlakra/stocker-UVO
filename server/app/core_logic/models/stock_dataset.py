# backend/app/core_logic/models/stock_dataset.py
import torch
from torch.utils.data import Dataset

class StockDataset(Dataset):
    def __init__(self, features, targets):
        # Ensure features and targets are already numpy arrays or convert them
        self.features = torch.FloatTensor(features)
        self.targets = torch.FloatTensor(targets)
    
    def __len__(self):
        return len(self.features)
    
    def __getitem__(self, idx):
        return self.features[idx], self.targets[idx]