import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { Todo } from '../../../../shared/types';

// Select the result of the getTodos query
const selectTodosResult = apiSlice.endpoints.getTodos.select();

// Memoized selector to get the raw todos array
const selectAllTodos = createSelector(
  selectTodosResult,
  (todosResult) => todosResult.data ?? []
);

// Logic separated for testing
export const groupTodos = (todos: Todo[]) => {
  const grouped: Record<string, Todo[]> = {};
  todos.forEach(todo => {
    if (!grouped[todo.categoryId]) grouped[todo.categoryId] = [];
    grouped[todo.categoryId].push(todo);
  });
  return grouped;
};

// Memoized selector to group todos by category
export const selectGroupedTodos = createSelector(
  [selectAllTodos],
  groupTodos
);
