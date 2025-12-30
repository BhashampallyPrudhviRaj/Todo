import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { setTodoFilter } from '../features/ui/uiSlice';
import { 
  useGetTodosQuery, 
  useGetCategoriesQuery
} from '../features/api/apiSlice';
import { motion } from 'framer-motion';
import { ListTodo, CheckCircle2, Clock, TrendingUp, ArrowRight, Sun, Coffee } from 'lucide-react';
import { ActivityChart } from '../components/ActivityChart';
import { useUpdateTodoMutation } from '../features/api/apiSlice';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // RTK Query Hooks
  const { data: todos = [], isLoading, isError } = useGetTodosQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [updateTodo] = useUpdateTodoMutation();

  // Click handler for stat cards
  const handleCardClick = (filter: 'all' | 'active' | 'completed') => {
    dispatch(setTodoFilter(filter));
    navigate('/todos');
  };

  const getTimeGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return { text: "Good Morning", icon: <Coffee size={24} className="text-orange-400" /> };
      if (hour < 18) return { text: "Good Afternoon", icon: <Sun size={24} className="text-yellow-400" /> };
      return { text: "Good Evening", icon: <Coffee size={24} className="text-purple-400" /> };
  };

  const handleComplete = async (e: React.MouseEvent, todoId: string) => {
      e.stopPropagation();
      try {
          await updateTodo({ id: todoId, updates: { isCompleted: true } }).unwrap();
          toast.success("Task completed!");
      } catch (err) {
          toast.error("Failed to update");
      }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.isCompleted).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Due soon (next 7 days, including full 7th day until 11:59 PM)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    nextWeek.setHours(23, 59, 59, 999); // End of 7th day
    
    // Get actual task objects for Due Soon
    const dueSoonTasks = todos.filter(t => {
      if (!t.dueDate || t.isCompleted) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= now && dueDate <= nextWeek;
    }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3); // Top 3
    
    const dueSoonCount = todos.filter(t => {
        if (!t.dueDate || t.isCompleted) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= now && dueDate <= nextWeek;
    }).length;

    return { total, completed, active, completionRate, dueSoonCount, dueSoonTasks };
  }, [todos]);

  // Recent todos (last 5 active)
  const recentTodos = useMemo(() => {
    return [...todos]
      .filter(t => !t.isCompleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [todos]);

  // Categories with task counts
  const categoryStats = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      todoCount: todos.filter(t => t.categoryId === cat.id).length,
      activeCount: todos.filter(t => t.categoryId === cat.id && !t.isCompleted).length
    })).sort((a, b) => b.todoCount - a.todoCount);
  }, [categories, todos]);

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  if (isError && todos.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
          Unable to load dashboard data
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <div className="flex items-center gap-2 mb-2">
                {getTimeGreeting().icon}
                <h1 style={{ margin: 0, fontSize: '2rem' }}>{getTimeGreeting().text}</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginLeft: '2.5rem' }}>
            Here's your productivity overview.
            </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleCardClick('all')}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(124, 58, 237, 0.3)' }}
          style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ 
              background: 'var(--primary)', 
              borderRadius: '12px', 
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ListTodo size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.total}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Tasks</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleCardClick('active')}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0, 242, 254, 0.3)' }}
          style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #00f2fe, #4facfe)', 
              borderRadius: '12px', 
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.active}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Tasks</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleCardClick('completed')}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(60, 245, 122, 0.3)' }}
          style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3cf57a, #00d4ff)', 
              borderRadius: '12px', 
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.completed}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completed</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleCardClick('all')}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(245, 87, 108, 0.3)' }}
          style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f093fb, #f5576c)', 
              borderRadius: '12px', 
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.completionRate}%</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completion Rate</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ACTIVITY CHART */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ marginBottom: '3rem' }}
      >
        <ActivityChart todos={todos} />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* RECENT TASKS */}
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Tasks</h2>
            <Link 
              to="/todos" 
              style={{ 
                color: 'var(--primary)', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {recentTodos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No active tasks. Create one to get started!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTodos.map((todo, idx) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{todo.title}</div>
                  {todo.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {todo.description}
                    </div>
                  )}
                  {todo.dueDate && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                      Due: {new Date(todo.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* CATEGORY OVERVIEW */}
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Categories</h2>
            <Link 
              to="/categories" 
              style={{ 
                color: 'var(--primary)', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              Manage <ArrowRight size={16} />
            </Link>
          </div>
          
          {categoryStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No categories yet. Create one to organize your tasks!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categoryStats.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: 'var(--primary)' 
                    }} />
                    <span style={{ fontWeight: '500' }}>{cat.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {cat.activeCount} active
                    </span>
                    <span style={{ color: 'var(--primary)' }}>
                      {cat.todoCount} total
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {stats.dueSoonCount > 0 && (
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ 
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.05), rgba(240, 147, 251, 0.05))',
            border: '1px solid rgba(245, 87, 108, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 87, 108, 0.1)', borderRadius: '10px' }}>
                 <Clock size={24} color="#f5576c" />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {stats.dueSoonCount} Task{stats.dueSoonCount !== 1 ? 's' : ''} Due Soon
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Focus on these priority items
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {stats.dueSoonTasks.map((task, i) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                    className="group"
                    style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '1rem', 
                        borderRadius: '12px',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        border: '1px solid transparent'
                    }}
                    whileHover={{ borderColor: 'rgba(245, 87, 108, 0.3)', background: 'rgba(0,0,0,0.3)' }}
                  >
                        <div>
                            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{task.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#f5576c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                        </div>
                        <button 
                            onClick={(e) => handleComplete(e, task.id)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(74, 222, 128, 0.2)';
                              e.currentTarget.style.color = '#4ade80';
                              e.currentTarget.style.borderColor = '#4ade80';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.color = 'var(--text-muted)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            title="Complete Task"
                        >
                            <CheckCircle2 size={18} />
                        </button>
                  </motion.div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
