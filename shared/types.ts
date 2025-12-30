export interface Category {
  id: string;
  name: string;
  createdAt: string; // ISO Date String
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO Date String
  createdAt: string; // ISO Date String
  isCompleted: boolean;
  categoryId: string; // Foreign Key link
  order?: number; // For drag and drop ordering
}

export type CreateTodoDto = Omit<Todo, 'id' | 'createdAt' | 'isCompleted'>;
export type CreateCategoryDto = Omit<Category, 'id' | 'createdAt'>;

export type FilterStatus = 'all' | 'active' | 'completed';
export type SortOption = 'dueDate' | 'createdAt';

export type AddTodoRequest = CreateTodoDto;
export type UpdateTodoRequest = Partial<CreateTodoDto> & { isCompleted?: boolean; categoryId?: string };

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}