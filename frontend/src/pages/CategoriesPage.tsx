import { useState, useMemo } from 'react';
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useGetTodosQuery
} from '../features/api/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, Target, CheckCircle2, ArrowUpAZ, ArrowDownAZ, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  selectCatSortBy,
  selectCatSortDirection,
  setCatSortBy,
  setCatSortDirection
} from '../features/ui/uiSlice';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';



import { createPortal } from 'react-dom';

const CategoriesPage = () => {
  const dispatch = useAppDispatch();
  const catSortBy = useAppSelector(selectCatSortBy);
  const catSortDirection = useAppSelector(selectCatSortDirection);

  const { data: categories = [], isLoading, isError } = useGetCategoriesQuery();
  const { data: todos = [] } = useGetTodosQuery();
  const [addCategory] = useAddCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [newCatName, setNewCatName] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<{ id: string; x: number; y: number } | null>(null);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
    taskCount: number;
  }>({
    isOpen: false,
    categoryId: '',
    categoryName: '',
    taskCount: 0
  });

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; percentage: number }> = {};

    categories.forEach(cat => {
      const catTodos = todos.filter(t => t.categoryId === cat.id);
      const total = catTodos.length;
      const completed = catTodos.filter(t => t.isCompleted).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      stats[cat.id] = { total, completed, percentage };
    });

    return stats;
  }, [categories, todos]);

  // Sorted Categories
  const sortedCategories = useMemo(() => {
    let sorted = [...categories];

    if (catSortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (catSortBy === 'count') {
      sorted.sort((a, b) => {
        const countA = categoryStats[a.id]?.total || 0;
        const countB = categoryStats[b.id]?.total || 0;
        return countB - countA;
      });
    } else if (catSortBy === 'progress') {
      sorted.sort((a, b) => {
        const progressA = categoryStats[a.id]?.percentage || 0;
        const progressB = categoryStats[b.id]?.percentage || 0;
        return progressB - progressA;
      });
    }

    if (catSortDirection === 'desc') {
      sorted.reverse();
    }

    return sorted;
  }, [categories, catSortBy, catSortDirection, categoryStats]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const duplicate = categories.find(
      cat => cat.name.toLowerCase() === newCatName.trim().toLowerCase()
    );

    if (duplicate) {
      toast.error(`Category "${newCatName.trim()}" already exists`);
      return;
    }

    try {
      await addCategory({ name: newCatName.trim() }).unwrap();
      toast.success(`Category "${newCatName}" added!`);
      setNewCatName('');
    } catch (err) {
      const errorMsg = (err as any)?.data?.errors?.[0] || 'Failed to add category';
      toast.error(errorMsg);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    const stats = categoryStats[id] || { total: 0, completed: 0, percentage: 0 };
    setConfirmDialog({
      isOpen: true,
      categoryId: id,
      categoryName: name,
      taskCount: stats.total
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(confirmDialog.categoryId).unwrap();
      toast.success(`Category "${confirmDialog.categoryName}" deleted`);
    } catch (err) {
      toast.error('Failed to delete category');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading categories...</div>;
  if (isError) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Error loading categories.</div>;


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Categories</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage your project groups and track progress.</p>
          </div>

          <div className="filter-bar">
             <div className="filter-chip">
                <span className="chip-text">
                  {catSortBy === 'name' ? 'Name' : catSortBy === 'count' ? 'Task Count' : 'Progress %'}
                </span>
                <ChevronDown size={14} className="chip-arrow" />
                <select
                    value={catSortBy}
                    onChange={(e) => dispatch(setCatSortBy(e.target.value as any))}
                    className="chip-select"
                >
                    <option value="name">Name</option>
                    <option value="count">Task Count</option>
                    <option value="progress">Progress %</option>
                </select>
                <button
                    onClick={() => dispatch(setCatSortDirection(catSortDirection === 'asc' ? 'desc' : 'asc'))}
                    className="icon-btn sort-dir-btn"
                    title={catSortDirection === 'asc' ? "Ascending" : "Descending"}
                >
                    {catSortDirection === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
                </button>
             </div>
          </div>
      </div>
      
      <form onSubmit={handleAddCategory} className="input-group" style={{ maxWidth: '600px', marginBottom: '3rem' }}>
        <Input 
          placeholder="New Category Name..." 
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="primary">
          <Plus size={20} />
          Create
        </Button>
      </form>

      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
      }}>
        <AnimatePresence mode="popLayout">
            {sortedCategories.map((cat, index) => {
              const stats = categoryStats[cat.id] || { total: 0, completed: 0, percentage: 0 };
              
              return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--card-border)'
                }}
              >
                  {/* Decorative Gradient Background */}
                  <div style={{
                      position: 'absolute', top: '-50px', right: '-50px',
                      width: '150px', height: '150px',
                      background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)',
                      borderRadius: '50%',
                      pointerEvents: 'none'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                              width: '40px', height: '40px', 
                              borderRadius: '12px', 
                              background: 'var(--surface-1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--primary)'
                          }}>
                              <Target size={20} />
                          </div>
                          <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{cat.name}</h3>
                                {cat.createdAt && (
                                  <>
                                    <span 
                                      onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setActiveTooltip({ 
                                          id: cat.id,
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
                                    {activeTooltip?.id === cat.id && createPortal(
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
                                        Created: {new Date(cat.createdAt).toLocaleDateString()} at {new Date(cat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>,
                                      document.body
                                    )}
                                  </>
                                )}
                              </div>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stats.total} Tasks</span>
                          </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteClick(cat.id, cat.name)}
                        style={{ 
                            background: 'transparent', border: 'none', 
                            color: 'var(--text-muted)', cursor: 'pointer',
                            opacity: 0.6, transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                      >
                          <Trash2 size={18} />
                      </button>
                  </div>

                  {/* Progress Bar */}
                  <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                          <span>Progress</span>
                          <span>{stats.percentage}%</span>
                      </div>
                      <div style={{ 
                          width: '100%', height: '6px', 
                          background: 'var(--surface-1)', 
                          borderRadius: '4px', overflow: 'hidden' 
                      }}>
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${stats.percentage}%` }}
                             transition={{ duration: 1, ease: "easeOut" }}
                             style={{ 
                                 height: '100%', 
                                 background: stats.percentage === 100 ? 'var(--success)' : 'var(--primary)',
                                 borderRadius: '4px'
                             }}
                          />
                      </div>
                      {stats.percentage === 100 && stats.total > 0 && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> All tasks completed!
                          </div>
                      )}
                  </div>
              </motion.div>
            )})}
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={
          confirmDialog.taskCount > 0
            ? `Are you sure you want to delete "${confirmDialog.categoryName}"? This will also delete ${confirmDialog.taskCount} task${confirmDialog.taskCount === 1 ? '' : 's'} in this category.`
            : `Are you sure you want to delete "${confirmDialog.categoryName}"?`
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default CategoriesPage;
