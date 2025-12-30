import express from 'express';
import * as TodoController from '../controllers/todoController';
import * as CategoryController from '../controllers/categoryController';

const router = express.Router();

// Todo Routes
router.get('/todos', TodoController.getTodos);
router.get('/todos/:id', TodoController.getTodoById);
router.post('/todos', TodoController.createTodo);
router.put('/todos/reorder', TodoController.reorderTodos); 
router.put('/todos/:id', TodoController.updateTodo);
router.patch('/todos/:id', TodoController.updateTodo); 
router.delete('/todos/:id', TodoController.deleteTodo);

// Category Routes
router.get('/categories', CategoryController.getCategories);
router.post('/categories', CategoryController.createCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

export default router;