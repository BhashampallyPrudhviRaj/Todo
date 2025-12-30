import { describe, it, expect } from 'vitest';
import { groupTodos } from './todoSelectors';
import { Todo } from '../../../../shared/types';

describe('groupTodos', () => {
  const mockTodos: Todo[] = [
    { id: '1', title: 'Task 1', description: '', categoryId: 'cat1', isCompleted: false, dueDate: '', createdAt: '' },
    { id: '2', title: 'Task 2', description: '', categoryId: 'cat1', isCompleted: true, dueDate: '', createdAt: '' },
    { id: '3', title: 'Task 3', description: '', categoryId: 'cat2', isCompleted: false, dueDate: '', createdAt: '' },
  ];

  it('should group todos by categoryId', () => {
    const result = groupTodos(mockTodos);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result['cat1']).toHaveLength(2);
    expect(result['cat2']).toHaveLength(1);
  });

  it('should return empty object for empty todos', () => {
    const result = groupTodos([]);
    expect(result).toEqual({});
  });

  it('should handle todos with new categories dynamically', () => {
    const newTodo = { id: '4', title: 'Task 4', description: '', categoryId: 'cat3', isCompleted: false, dueDate: '', createdAt: '' };
    const result = groupTodos([...mockTodos, newTodo]);
    expect(result['cat3']).toHaveLength(1);
  });
});
