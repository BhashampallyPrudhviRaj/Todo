import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import { 
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'; 
import { useState } from 'react';
import { Todo, Category, SortOption } from '../../../../shared/types';
import { TodoItem } from './TodoItem';
import { BoardColumn } from './BoardColumn';

interface TodoBoardProps {
  groupedTodos: Record<string, Todo[]>;
  categories: Category[];
  sortBy?: SortOption | '';
  sortDirection?: 'asc' | 'desc';
  onEdit: (todo: Todo) => void;
  onMoveTodo: (todoId: string, newPkgId: string, newIndex: number) => void; 
}

export const TodoBoard = ({ groupedTodos, categories, onEdit, onMoveTodo }: TodoBoardProps) => {
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  // Note: categories and groupedTodos are already sorted by the parent component (MyTodos)
  // We use them directly to ensure consistency across views.

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  const findContainer = (id: string): string | undefined => {
    if (groupedTodos[id]) return id; // Is a container (category)
    return Object.keys(groupedTodos).find((key) => 
      groupedTodos[key].some(t => t.id === id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = Object.values(groupedTodos)
      .flat()
      .find(t => t.id === active.id);
    setActiveTodo(todo || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active: _active, over: _over } = event;
    // Implementation for visual drag over (moving between containers) is handled by DndContext
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    // Find which category the item was dropped into
    const overCategoryId = findContainer(overId);
    if (!overCategoryId) return;

    const overTodos = groupedTodos[overCategoryId] || [];
    const overIndex = overTodos.findIndex(t => t.id === overId);

    onMoveTodo(activeId, overCategoryId, overIndex >= 0 ? overIndex : overTodos.length);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="snap-scroll-x"
        style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          overflowX: 'auto', 
          paddingBottom: '2rem',
          alignItems: 'flex-start',
          width: '100%',
          scrollBehavior: 'smooth'
        }}
      >
        {categories.map(cat => (
           <BoardColumn 
             key={cat.id} 
             category={cat} 
             todos={groupedTodos[cat.id] || []} 
             onEdit={onEdit} 
           />
        ))}
      </div>
       <DragOverlay dropAnimation={dropAnimation}>
          {activeTodo ? <TodoItem todo={activeTodo} onEdit={onEdit} isDraggable /> : null}
      </DragOverlay>
    </DndContext>
  );
};
