import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '../../../../shared/types';
import { SwipeableTodoItem } from './SwipeableTodoItem';

interface Props {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  disableSwipe?: boolean;
}

export const SortableTodoItem = ({ todo, onEdit, disableSwipe }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const,
    touchAction: 'none' 
  };

  // Strategy:
  // 1. Sortable wrapper handles vertical sorting.
  // 2. Swipeable wrapper inside handles horizontal swipe.
  // 3. To avoid conflict, Sortable should activate with Delay or Drag Handle, or Swipeable only horizontal.
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SwipeableTodoItem todo={todo} onEdit={onEdit} isDraggable={false} disableSwipe={disableSwipe} />
    </div>
  );
};
