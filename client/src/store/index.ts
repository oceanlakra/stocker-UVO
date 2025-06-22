// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import rootReducer from './rootReducer'; // Import the combined rootReducer

export const store = configureStore({
  reducer: rootReducer, // Use the rootReducer
  devTools: process.env.NODE_ENV !== 'production',
});

// RootState is now defined and exported from rootReducer.ts
// We only need to define and export AppDispatch here.
export type AppDispatch = typeof store.dispatch;

// Export for easier importing
export type { RootState } from './rootReducer'; // Re-export RootState for convenience
export const useAppDispatch = () => useDispatch<AppDispatch>();