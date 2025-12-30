import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  categoryId: z.string().min(1, "Category ID is required")
});

export const updateTodoSchema = createTodoSchema.partial().extend({
  isCompleted: z.boolean().optional()
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long")
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
