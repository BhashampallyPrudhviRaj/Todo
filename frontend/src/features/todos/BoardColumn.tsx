import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Todo, Category } from '../../../../shared/types';
import { SortableTodoItem } from './SortableTodoItem';

interface BoardColumnProps {
  category: Category;
  todos: Todo[];
  onEdit: (todo: Todo) => void;
}

export const BoardColumn = ({ category, todos, onEdit }: BoardColumnProps) => {
  const { setNodeRef } = useSortable({
      id: category.id,
      data: {
          type: 'Container',
      }
  });

  return (
    <div 
        ref={setNodeRef}
        className="glass-card snap-center" 
        style={{ 
            minWidth: '320px', 
            background: 'var(--surface-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
            borderRadius: '16px',
            flexShrink: 0
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
             {category.name}
             <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                 {todos.length}
             </span>
        </div>
        
        <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '100px' }}>
                {todos.map(todo => (
                    <SortableTodoItem key={todo.id} todo={todo} onEdit={onEdit} disableSwipe={true} />
                ))}
             </div>
        </SortableContext>
    </div>
  );
};
