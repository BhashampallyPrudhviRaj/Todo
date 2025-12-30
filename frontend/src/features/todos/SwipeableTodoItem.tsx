import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Todo } from '../../../../shared/types';
import { TodoItem } from './TodoItem';
import { useDeleteTodoMutation, useUpdateTodoMutation } from '../api/apiSlice';
import toast from 'react-hot-toast';
import { Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  isDraggable?: boolean;
  disableSwipe?: boolean;
}

export const SwipeableTodoItem = ({ todo, onEdit, isDraggable, disableSwipe = false }: Props) => {
  const [deleteTodo] = useDeleteTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();
  const controls = useAnimation();

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    if (disableSwipe) return;

    const threshold = 100;

    if (info.offset.x > threshold) {
      // Swipe Right -> Complete
      try {
        await updateTodo({
            id: todo.id,
            updates: { isCompleted: !todo.isCompleted }
        }).unwrap();
        toast.success(todo.isCompleted ? "Task Active" : "Task Completed");
        controls.start({ x: 0 });
      } catch (e) {
        controls.start({ x: 0 });
      }
    } else if (info.offset.x < -threshold) {
      // Swipe Left -> Delete
      try {
        await deleteTodo(todo.id).unwrap();
        toast.success("Task Deleted");
      } catch (e) {
        controls.start({ x: 0 });
      }
    } else {
      // Reset
      controls.start({ x: 0 });
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
      {/* Background Actions - Only show if swipe is enabled */}
      {!disableSwipe && (
        <div style={{ 
            position: 'absolute', inset: 0, 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '0 1.5rem',
            background: 'linear-gradient(to right, var(--success-muted) 0%, var(--success-muted) 50%, var(--danger-muted) 50%, var(--danger-muted) 100%)' 
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <CheckCircle2 color="var(--success)" size={24} />
               <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>Complete</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}>Delete</span>
               <Trash2 color="var(--danger)" size={24} />
            </div>
        </div>
      )}

      <motion.div
        drag={disableSwipe ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ position: 'relative', background: 'var(--card-solid)' }}
      >
         <TodoItem todo={todo} onEdit={onEdit} isDraggable={isDraggable} />
      </motion.div>
    </div>
  );
};
