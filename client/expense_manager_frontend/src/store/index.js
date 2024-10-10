import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import categoryReducer from './categorySlice';
import expenseReducer from './expenseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    expenses: expenseReducer,
  },
});
