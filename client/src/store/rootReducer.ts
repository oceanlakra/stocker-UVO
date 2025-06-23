import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import { predictionReducer } from '@/features/prediction/predictionSlice';
import { comparisonReducer } from '@/features/comparison/comparisonSlice'; 
import { analysisReducer } from '@/features/analysis/analysisSlice'; // 1. Import the new reducer

const rootReducer = combineReducers({
  auth: authReducer,
  prediction: predictionReducer,
  comparison: comparisonReducer,
  analysis: analysisReducer // 2. Add it to the store
});

// Export the RootState type, derived from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;