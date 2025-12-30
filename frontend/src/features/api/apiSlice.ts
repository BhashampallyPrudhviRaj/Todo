import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Todo, Category, CreateCategoryDto, PaginatedResponse, PaginationParams, AddTodoRequest, UpdateTodoRequest } from '../../../../shared/types';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl,
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['Todos', 'Categories'],
  endpoints: (builder) => ({
    getTodos: builder.query<Todo[], void | { status?: string; sortBy?: string; search?: string } & PaginationParams>({
      query: (params: any) => ({
        url: '/todos',
        params,
      }),
      transformResponse: (response: PaginatedResponse<Todo>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Todos' as const, id })),
              { type: 'Todos', id: 'LIST' },
            ]
          : [{ type: 'Todos', id: 'LIST' }],
    }),
    getTodoById: builder.query<Todo, string>({
      query: (id) => `/todos/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Todos', id }],
    }),
    addTodo: builder.mutation<Todo, AddTodoRequest>({
      query: (body) => ({
        url: '/todos',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
    }),
    reorderTodos: builder.mutation<void, { id: string; order: number }[]>({
      query: (items) => ({
        url: '/todos/reorder',
        method: 'PUT',
        body: { items },
      }),
      invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
    }),
    updateTodo: builder.mutation<Todo, { id: string; updates: UpdateTodoRequest }>({
      query: ({ id, updates }) => ({
        url: `/todos/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Todos', id }, { type: 'Todos', id: 'LIST' }],
    }),
    deleteTodo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Todos', id }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
    addCategory: builder.mutation<Category, CreateCategoryDto>({
      query: (newCategory) => ({
        url: '/categories',
        method: 'POST',
        body: newCategory,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', { type: 'Todos', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useGetTodoByIdQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useReorderTodosMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
} = apiSlice;
