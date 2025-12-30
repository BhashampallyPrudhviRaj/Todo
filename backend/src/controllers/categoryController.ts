import { Request, Response, NextFunction } from 'express';
import { db } from '../models/db';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters")
});

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (error) { next(error); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: "Validation Error", 
        errors: result.error.issues.map(e => e.message) 
      });
      return;
    }

    // Check for duplicate category name
    const existingCategories = await db.getCategories();
    const duplicate = existingCategories.find(
      cat => cat.name.toLowerCase() === result.data.name.toLowerCase()
    );
    
    if (duplicate) {
      res.status(409).json({ 
        message: "Conflict", 
        errors: [`Category with name "${result.data.name}" already exists`]
      });
      return;
    }

    const newCategory = await db.createCategory(result.data.name);
    res.status(201).json(newCategory);
  } catch (error) { next(error); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id) && !['1', '2'].includes(id)) { // Allow default IDs
      res.status(400).json({ 
        message: "Invalid category ID format"
      });
      return;
    }

    const success = await db.deleteCategory(id);
    if (!success) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    
    res.status(204).send();
  } catch (error) { next(error); }
};
