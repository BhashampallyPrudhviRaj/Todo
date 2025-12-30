import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAddTodoMutation } from '../api/apiSlice';
import { Category } from '../../../../shared/types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { createTodoSchema } from '../../../../shared/schemas';

interface AddTodoFormProps {
  categories: Category[];
}

export const AddTodoForm = ({ categories }: AddTodoFormProps) => {
  const [addTodo] = useAddTodoMutation();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Manual Title Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
        newErrors.title = "Title is required";
    } else if (!/[a-zA-Z0-9]/.test(title)) {
        newErrors.title = "Title must contain at least one letter or number";
    }

    if (!categoryId) {
        newErrors.categoryId = "Category is required";
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    // Validate using shared schema (secondary check)
    const validation = createTodoSchema.safeParse({
      title,
      description: desc,
      dueDate: dueDate || undefined,
      categoryId
    });

    if (!validation.success) {
      const formattedErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((issue: any) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      await addTodo({
        title,
        description: desc,
        categoryId,
        dueDate: dueDate || new Date().toISOString()
      }).unwrap();
      
      toast.success('Todo added successfully');
      setTitle('');
      setDesc('');
      setDueDate('');
      setCategoryId('');
    } catch (err) {
      toast.error('Failed to add todo');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-group glass-card" style={{ marginBottom: '3rem', flexDirection: 'column', gap: '1rem' }}>
      {/* First Row - Title and Category */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 200px', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Input 
            placeholder="Task title..." 
            value={title}
            onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                // Clear error if valid
                if (errors.title) {
                     if (val.trim() && /[a-zA-Z0-9]/.test(val)) {
                         setErrors(prev => {
                             const newErrors = { ...prev };
                             delete newErrors.title;
                             return newErrors;
                         });
                     }
                }
            }}
            style={{ 
              width: '100%',
              borderColor: errors.title ? 'var(--danger)' : undefined 
            }} 
          />
          {errors.title && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', paddingLeft: '0.25rem' }}>{errors.title}</span>}
        </div>

        <div style={{ flex: '1 1 150px', minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <select 
            value={categoryId} 
            onChange={(e) => {
                const val = e.target.value;
                setCategoryId(val);
                if (val && errors.categoryId) {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.categoryId;
                        return newErrors;
                    });
                }
            }}
            style={{ 
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              border: `1px solid ${errors.categoryId ? 'var(--danger)' : 'var(--card-border)'}`,
              borderRadius: '12px',
              color: 'white'
            }}
          >
            <option value="" disabled>Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', paddingLeft: '0.25rem' }}>{errors.categoryId}</span>}
        </div>
      </div>

      {/* Second Row - Description, Date, and Button */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap', alignItems: 'flex-start' }}>
         <Input 
          placeholder="Description (optional)" 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ flex: '1 1 200px', minWidth: '200px' }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 150px', minWidth: '150px' }}>
            <Input 
            type="date" 
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ width: '100%' }}
            />
            {!dueDate && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.25rem', marginTop: '0.25rem' }}>Defaults to Today</span>}
        </div>
        <Button 
          type="submit" 
          variant="primary"
          style={{ 
            flex: '0 0 auto',
            minWidth: '100px',
            whiteSpace: 'nowrap'
          }}
        >
          <Plus size={20} />
          Add
        </Button>
      </div>
    </form>
  );
};
