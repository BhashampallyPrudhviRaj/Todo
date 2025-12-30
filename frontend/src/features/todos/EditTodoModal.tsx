import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo, Category } from '../../../../shared/types';

interface EditTodoModalProps {
  todo: Todo | null;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Todo>) => Promise<void>;
}

export const EditTodoModal = ({ todo, categories, onClose, onSave }: EditTodoModalProps) => {
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCat, setEditCat] = useState('');

  useEffect(() => {
    if (todo) {
      setEditTitle(todo.title);
      setEditDesc(todo.description || '');
      setEditDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
      setEditCat(todo.categoryId);
    }
  }, [todo]);

  const handleSave = () => {
    if (todo && editTitle && editCat) {
      onSave(todo.id, {
        title: editTitle,
        description: editDesc,
        // Append noon time to prevent timezone shift issues (00:00:00Z often shifts to previous day)
        dueDate: editDueDate ? new Date(editDueDate + 'T12:00:00').toISOString() : todo.dueDate,
        categoryId: editCat
      });
    }
  };

  return (
    <AnimatePresence>
      {todo && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
          }}
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-card" 
            style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#1e1b4b' }}
            onClick={e => e.stopPropagation()}
          >
             <h2 style={{ margin: 0 }}>Edit Task</h2>
             <input 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                placeholder="Title" 
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                }}
             />
             <textarea 
               value={editDesc} 
               onChange={(e) => setEditDesc(e.target.value)} 
               placeholder="Description"
               style={{ 
                   background: 'rgba(255,255,255,0.05)', 
                   border: '1px solid var(--card-border)', 
                   borderRadius: '12px', 
                   padding: '0.75rem', 
                   color: 'white', 
                   minHeight: '80px',
                   fontFamily: 'inherit',
                   resize: 'vertical'
               }} 
             />
             <div style={{ display: 'flex', gap: '1rem' }}>
               <select 
                  value={editCat} 
                  onChange={(e) => setEditCat(e.target.value)} 
                  style={{ 
                      flex: 1,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      color: 'white'
                  }}
               >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               <input 
                  type="date" 
                  value={editDueDate} 
                  onChange={(e) => setEditDueDate(e.target.value)} 
                  style={{ 
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      color: 'white',
                      outline: 'none',
                      colorScheme: 'dark'
                  }} 
               />
             </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
               <button 
                  onClick={onClose} 
                  style={{ 
                      background: 'transparent', 
                      border: '1px solid var(--text-muted)', 
                      color: 'var(--text-muted)', 
                      borderRadius: '12px', 
                      padding: '0.5rem 1rem', 
                      cursor: 'pointer' 
                  }}
               >
                  Cancel
               </button>
               <button onClick={handleSave} className="primary">Save Changes</button>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
