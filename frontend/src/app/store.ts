import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { apiSlice } from '../features/api/apiSlice';
import uiReducer, { setTodoFilter, setTodoSortBy, setTodoSearch } from '../features/ui/uiSlice';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(setTodoFilter, setTodoSortBy, setTodoSearch),
  effect: (_action, listenerApi) => {
    localStorage.setItem('uiState', JSON.stringify((listenerApi.getState() as RootState).ui));
  },
});

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;