import { Todo, Category, CreateTodoDto, PaginatedResponse } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../../data.json');

interface Schema {
  todos: Todo[];
  categories: Category[];
}

class FileDB {
  private data: Schema = {
    todos: [],
    categories: [
      { id: '1', name: 'Work', createdAt: new Date().toISOString() },
      { id: '2', name: 'Personal', createdAt: new Date().toISOString() }
    ]
  };
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      await this.save();
    }
    this.initialized = true;
  }

  private async save() {
    await fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2));
  }

  // --- Todos ---
  async getTodos(options: { 
    status?: string; 
    sortBy?: string; 
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ data: Todo[], meta: any }> {
    await this.init();
    let result = [...this.data.todos];

    // Filter by Status
    if (options.status === 'active') {
      result = result.filter(t => !t.isCompleted);
    } else if (options.status === 'completed') {
      result = result.filter(t => t.isCompleted);
    }

    // Search (Title or Description)
    if (options.search) {
      const term = options.search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(term) || 
        (t.description && t.description.toLowerCase().includes(term))
      );
    }

    // Sort
    if (options.sortBy) {
      const field = options.sortBy as 'dueDate' | 'createdAt';
      result.sort((a, b) => {
        const dateA = new Date(a[field]).getTime();
        const dateB = new Date(b[field]).getTime();
        
        // Descending for creation (newest first)
        if (field === 'createdAt') return dateB - dateA;
        // Ascending for due date (soonest first)
        return dateA - dateB;
      });
    }

    // Pagination
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 100; // Default to 100 to maintain behavior if not specified
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    
    // Slice data for pagination
    const paginatedData = result.slice(offset, offset + limit);

    return {
      data: paginatedData,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    await this.init();
    return this.data.todos.find(t => t.id === id);
  }

  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'isCompleted' | 'order'>): Promise<Todo> {
    await this.init();
    const newTodo: Todo = {
      id: uuidv4(),
      ...todo,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      order: this.data.todos.length
    };
    this.data.todos.push(newTodo);
    await this.save();
    return newTodo;
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    await this.init();
    const index = this.data.todos.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.data.todos[index] = { ...this.data.todos[index], ...updates };
    await this.save();
    return this.data.todos[index];
  }

  async reorderTodos(items: { id: string; order: number }[]): Promise<void> {
    await this.init(); // Ensure DB is initialized
    items.forEach(item => {
      const todo = this.data.todos.find(t => t.id === item.id);
      if (todo) {
        todo.order = item.order;
      }
    });
    await this.save();
  }

  async deleteTodo(id: string): Promise<boolean> {
    await this.init();
    const initialLen = this.data.todos.length;
    this.data.todos = this.data.todos.filter(t => t.id !== id);
    const success = this.data.todos.length !== initialLen;
    if (success) await this.save();
    return success;
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    await this.init();
    return [...this.data.categories];
  }

  async createCategory(name: string): Promise<Category> {
    await this.init();
    const newCat = { 
      id: uuidv4(), 
      name,
      createdAt: new Date().toISOString()
    };
    this.data.categories.push(newCat);
    await this.save();
    return newCat;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.init();
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    const success = this.data.categories.length !== initialLen;
    
    if (success) {
      // Cascade delete: Remove all todos associated with this category
      const initialTodoCount = this.data.todos.length;
      this.data.todos = this.data.todos.filter(t => t.categoryId !== id);
      const deletedTodoCount = initialTodoCount - this.data.todos.length;
      
      console.log(`Deleted category ${id} and ${deletedTodoCount} associated todo(s)`);
      await this.save();
    }
    
    return success;
  }
}


export const db = new FileDB();