import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { FilterStatus, SortOption } from '../../../../shared/types';


interface UIState {
  todoFilter: FilterStatus;
  todoSortBy: SortOption;
  todoSortDirection: 'asc' | 'desc';
  todoSearch: string;
  catSortBy: 'name' | 'count' | 'progress';
  catSortDirection: 'asc' | 'desc';
  theme: 'light' | 'dark' | 'system';
}

const loadState = (): UIState => {
  try {
    const serializedState = localStorage.getItem('uiState');
    if (serializedState === null) {
      return {
        todoFilter: 'all',
        todoSortBy: 'createdAt',
        todoSortDirection: 'desc',
        todoSearch: '',
        catSortBy: 'name',
        catSortDirection: 'asc',
        theme: 'dark' 
      };
    }
    const state = JSON.parse(serializedState);
    if (!state.todoSortDirection) state.todoSortDirection = 'desc';
    if (!state.catSortBy) state.catSortBy = 'name';
    if (!state.catSortDirection) state.catSortDirection = 'asc';
    if (!state.theme) state.theme = 'dark';
    return state;
  } catch (err) {
    return {
      todoFilter: 'all',
      todoSortBy: 'createdAt',
      todoSortDirection: 'desc',
      todoSearch: '',
      catSortBy: 'name',
      catSortDirection: 'asc',
      theme: 'dark'
    };
  }
};

const initialState: UIState = loadState();

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTodoFilter(state, action: PayloadAction<FilterStatus>) {
      state.todoFilter = action.payload;
    },
    setTodoSortBy(state, action: PayloadAction<SortOption>) {
      state.todoSortBy = action.payload;
    },
    setTodoSortDirection(state, action: PayloadAction<'asc' | 'desc'>) {
      state.todoSortDirection = action.payload;
    },
    setTodoSearch(state, action: PayloadAction<string>) {
      state.todoSearch = action.payload;
    },
    setCatSortBy(state, action: PayloadAction<'name' | 'count' | 'progress'>) {
      state.catSortBy = action.payload;
    },
    setCatSortDirection(state, action: PayloadAction<'asc' | 'desc'>) {
      state.catSortDirection = action.payload;
    },
    setTheme(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.theme = action.payload;
    }
  },
});

export const { 
  setTodoFilter, setTodoSortBy, setTodoSortDirection, setTodoSearch,
  setCatSortBy, setCatSortDirection, setTheme
} = uiSlice.actions;
export default uiSlice.reducer;

// Selectors
export const selectTodoFilter = (state: RootState) => state.ui.todoFilter;
export const selectTodoSortBy = (state: RootState) => state.ui.todoSortBy;
export const selectTodoSortDirection = (state: RootState) => state.ui.todoSortDirection;
export const selectTodoSearch = (state: RootState) => state.ui.todoSearch;
export const selectCatSortBy = (state: RootState) => state.ui.catSortBy;
export const selectCatSortDirection = (state: RootState) => state.ui.catSortDirection;
export const selectTheme = (state: RootState) => state.ui.theme;

