import { Request, Response, NextFunction } from 'express';
import { db } from '../models/db';
import { z } from 'zod';
import { createTodoSchema, updateTodoSchema } from '../../../shared/schemas';

const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const getTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, sortBy, search, page, limit } = req.query;
    const result = await db.getTodos({
      status: status as string,
      sortBy: sortBy as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    res.json(result);
  } catch (error) { next(error); }
};

export const getTodoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!validateUUID(id)) {
      res.status(400).json({ message: "Invalid todo ID format" });
      return;
    }

    const todo = await db.getTodo(id);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    
    res.json(todo);
  } catch (error) { next(error); }
};

export const createTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = createTodoSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: result.error.issues.map((e: z.ZodIssue) => e.message) 
      });
      return;
    }

    const { title, description, dueDate, categoryId } = result.data;
    const newTodo = await db.createTodo({ 
      title, 
      description: description || '', 
      dueDate: dueDate || new Date().toISOString(),
      categoryId 
    });
    res.status(201).json(newTodo);
  } catch (error) { next(error); }
};

export const updateTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!validateUUID(id)) {
      res.status(400).json({ message: "Invalid todo ID format" });
      return;
    }

    const result = updateTodoSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: result.error.issues.map((e: z.ZodIssue) => e.message) 
      });
      return;
    }

    const updated = await db.updateTodo(id, result.data);
    if (!updated) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.json(updated);
  } catch (error) { next(error); }
};

export const deleteTodo = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!validateUUID(id)) {
    res.status(400).json({ message: "Invalid todo ID format" });
    return;
  }
  const success = await db.deleteTodo(req.params.id);
  if (!success) {
     res.status(404).json({ message: 'Todo not found' });
     return;
  }
  res.status(204).send();
};

export const reorderTodos = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Expect array of { id, order }
    if (!Array.isArray(items)) {
      res.status(400).json({ message: 'Invalid format. Expected items array.' });
      return;
    }
    
    await db.reorderTodos(items);
    res.status(200).json({ message: 'Todos reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reorder todos' });
  }
};