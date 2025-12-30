import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Todo } from '../../../../shared/types';
import { useDeleteTodoMutation, useUpdateTodoMutation } from '../api/apiSlice';
import { useState } from 'react';

import { createPortal } from 'react-dom';

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  isDraggable?: boolean;
}

export const TodoItem = ({ todo, onEdit, isDraggable }: TodoItemProps) => {
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number } | null>(null);

  const handleToggleComplete = async () => {
    try {
      await updateTodo({ 
        id: todo.id, 
        updates: { isCompleted: !todo.isCompleted } 
      }).unwrap();
      toast.success(todo.isCompleted ? "Task marked active" : "Task completed!");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo(todo.id).unwrap();
      toast.success("Task deleted!");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="todo-item"
      style={{ cursor: isDraggable ? 'grab' : 'default' }}
    >
      <div 
        className={`checkbox ${todo.isCompleted ? 'checked' : ''}`}
        onClick={(e) => {
          e.stopPropagation(); 
          handleToggleComplete();
        }}
        style={{ cursor: 'pointer' }}
      >
        {todo.isCompleted && <CheckCircle2 size={16} color="white" />}
        {!todo.isCompleted && <Circle size={16} className="text-muted" />}
      </div>
      
      <div className={`todo-title ${todo.isCompleted ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{todo.title}</span>
          {todo.createdAt && (
            <>
              <span 
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActiveTooltip({ 
                    x: rect.left + rect.width / 2, 
                    y: rect.top 
                  });
                }}
                onMouseLeave={() => setActiveTooltip(null)}
                style={{ 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer',
                  opacity: 0.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: '0.25rem'
                }}
              >
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
              {activeTooltip && createPortal(
                <div style={{
                  position: 'fixed',
                  top: activeTooltip.y - 8,
                  left: activeTooltip.x,
                  transform: 'translate(-50%, -100%)',
                  padding: '8px 12px',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  zIndex: 99999,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  color: '#ffffff',
                  pointerEvents: 'none',
                  fontWeight: 500
                }}>
                  Created: {new Date(todo.createdAt).toLocaleDateString()} at {new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>,
                document.body
              )}
            </>
          )}
        </div>
        {todo.description && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{todo.description}</span>}
        {todo.dueDate && (
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
            Due: {new Date(todo.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => onEdit(todo)}
          className="edit-btn"
          style={{ 
            color: 'var(--primary)', 
            padding: '0.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Edit2 size={18} />
        </button>
        <button 
          onClick={handleDelete}
          className="delete-btn"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};
