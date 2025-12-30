import { useMemo } from 'react';
import { Category, Todo, SortOption } from '../../../shared/types';

interface UseTodoSortingProps {
  categories: Category[];
  groupedTodos: Record<string, Todo[]>;
  sortBy: SortOption | '';
  sortDirection: 'asc' | 'desc';
}

export const useTodoSorting = ({ 
  categories, 
  groupedTodos, 
  sortBy, 
  sortDirection 
}: UseTodoSortingProps) => {
  
  const sortedCategories = useMemo(() => {
    return [...categories]
      .filter(cat => (groupedTodos[cat.id] || []).length > 0) // Only show categories with todos
      .sort((a, b) => {
        const aTodos = groupedTodos[a.id] || [];
        const bTodos = groupedTodos[b.id] || [];

        if (!sortBy) {
             // Default: Sort by Index (Stable default)
             const indexA = categories.findIndex(c => c.id === a.id);
             const indexB = categories.findIndex(c => c.id === b.id);
             return indexA - indexB;
        }

        // Global Sorting based on content
        const getRepresentativeValue = (todos: Todo[]) => {
            if (todos.length === 0) return sortDirection === 'asc' ? Infinity : -Infinity;
            
            const field = sortBy as 'dueDate' | 'createdAt';
            // Handle potentially undefined fields safely
            const values = todos.map(t => t[field] ? new Date(t[field]).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity));
            
            return sortDirection === 'asc' 
                ? Math.min(...values) 
                : Math.max(...values);
        };

        const valA = getRepresentativeValue(aTodos);
        const valB = getRepresentativeValue(bTodos);

        if (valA === valB) {
            // Tie-breaker: Name
            return a.name.localeCompare(b.name);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [categories, groupedTodos, sortBy, sortDirection]);

  return sortedCategories;
};
