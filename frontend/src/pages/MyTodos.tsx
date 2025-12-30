import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { 
  setTodoFilter, 
  setTodoSortBy, 
  setTodoSearch,
  setTodoSortDirection,
  selectTodoFilter,
  selectTodoSortBy,
  selectTodoSearch,
  selectTodoSortDirection
} from '../features/ui/uiSlice';
import { 
  useGetTodosQuery, 
  useUpdateTodoMutation,
  useReorderTodosMutation,
  useGetCategoriesQuery
} from '../features/api/apiSlice';
import { Todo, FilterStatus, SortOption, Category } from '../../../shared/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, SortAsc, SortDesc, Search, LayoutList, Kanban, ArrowUpAZ, ArrowDownAZ, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { AddTodoForm } from '../features/todos/AddTodoForm';
import { Input } from '../components/ui/Input';

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { SortableTodoItem } from '../features/todos/SortableTodoItem';
import { TodoBoard } from '../features/todos/TodoBoard';
import { EditTodoModal } from '../features/todos/EditTodoModal';
import { SwipeTutorial } from '../features/todos/SwipeTutorial';
import { useTodoSorting } from '../hooks/useTodoSorting';

type ViewMode = 'list' | 'board';

const MyTodos = () => {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectTodoFilter);
  const sortBy = useAppSelector(selectTodoSortBy);
  const sortDirection = useAppSelector(selectTodoSortDirection);
  const search = useAppSelector(selectTodoSearch);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);

  // Check if user has seen the swipe tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenSwipeTutorial');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowSwipeTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissTutorial = () => {
    setShowSwipeTutorial(false);
    localStorage.setItem('hasSeenSwipeTutorial', 'true');
  };

  // RTK Query Hooks
  const { data: todos = [], isLoading, isError } = useGetTodosQuery({ 
    status: filter, 
    sortBy, 
    search 
  });
  const { data: categories = [] } = useGetCategoriesQuery();
  const [updateTodo] = useUpdateTodoMutation();
  
  // Edit State
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Grouping & Sorting logic
  const groupedTodos = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};
    categories.forEach(c => grouped[c.id] = []);

    // 1. Sort Todos
    let sortedTodos = [...todos];
    if (sortBy) {
        sortedTodos.sort((a, b) => {
            const field = sortBy as 'dueDate' | 'createdAt';
            const dateA = new Date(a[field]).getTime();
            const dateB = new Date(b[field]).getTime();
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
    } else {
        sortedTodos.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // 2. Group
    sortedTodos.forEach(todo => {
      const catId = todo.categoryId;
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(todo);
    });
    return grouped;
  }, [todos, categories, sortBy, sortDirection]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [reorderTodos] = useReorderTodosMutation();

  const handleDragEndLink = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
       const activeTodo = todos.find(t => t.id === active.id);
       const overTodo = todos.find(t => t.id === over?.id);

       if (activeTodo && overTodo && activeTodo.categoryId === overTodo.categoryId) {
          const catId = activeTodo.categoryId;
          const currentGroup = groupedTodos[catId];
          const oldIndex = currentGroup.findIndex(t => t.id === active.id);
          const newIndex = currentGroup.findIndex(t => t.id === over?.id);
          
          if (oldIndex !== -1 && newIndex !== -1) {
             const newOrder = arrayMove(currentGroup, oldIndex, newIndex);
             const reorderedPayload = newOrder.map((todo, index) => ({
                 id: todo.id,
                 order: index
             }));
             await reorderTodos(reorderedPayload);
          }
       }
    }
  };

  const handleBoardMove = async (todoId: string, newPkgId: string, newIndex: number) => {
       const todo = todos.find(t => t.id === todoId);
       if (!todo) return;

       const isCategoryChange = todo.categoryId !== newPkgId;
       
       if (isCategoryChange) {
           await updateTodo({
               id: todoId,
               updates: { categoryId: newPkgId }
           }).unwrap();
           toast.success("Task moved");
       } else {
           const currentGroup = groupedTodos[newPkgId];
           const oldIndex = currentGroup.findIndex(t => t.id === todoId);
           const newOrder = arrayMove(currentGroup, oldIndex, newIndex);
           const reorderedPayload = newOrder.map((t, index) => ({
               id: t.id,
               order: index
           }));
           await reorderTodos(reorderedPayload);
       }
  };

  const handleSaveEdit = async (id: string, updates: Partial<Todo>) => {
    try {
      await updateTodo({ id, updates }).unwrap();
      toast.success("Task updated!");
      setEditingTodo(null);
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <SkeletonLoader height="40px" style={{ marginBottom: '2rem' }} />
        <SkeletonLoader height="100px" style={{ marginBottom: '2rem' }} />
        <SkeletonLoader height="200px" />
      </div>
    );
  }
  if (isError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Unable to load tasks</p>
        <button onClick={() => window.location.reload()} className="primary">Retry</button>
      </div>
    );
  }

  return (
    <MyTodosContent 
        viewMode={viewMode}
        setViewMode={setViewMode}
        search={search}
        setSearch={(val: string) => dispatch(setTodoSearch(val))}
        filter={filter}
        setFilter={(val: FilterStatus) => dispatch(setTodoFilter(val))}
        sortBy={sortBy}
        setSortBy={(val: SortOption) => dispatch(setTodoSortBy(val))}
        sortDirection={sortDirection}
        toggleSortDirection={() => dispatch(setTodoSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'))}
        categories={categories}
        groupedTodos={groupedTodos}
        sensors={sensors}
        handleDragEndLink={handleDragEndLink}
        startEdit={setEditingTodo}
        handleBoardMove={handleBoardMove}
        editingTodo={editingTodo}
        handleSaveEdit={handleSaveEdit}
        showSwipeTutorial={showSwipeTutorial}
        dismissTutorial={dismissTutorial}
    />
  );
};


interface MyTodosContentProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  search: string;
  setSearch: (val: string) => void;
  filter: FilterStatus;
  setFilter: (val: FilterStatus) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  sortDirection: 'asc' | 'desc';
  toggleSortDirection: () => void;
  categories: Category[];
  groupedTodos: Record<string, Todo[]>;
  sensors: any;
  handleDragEndLink: (event: DragEndEvent) => void;
  startEdit: (todo: Todo | null) => void;
  handleBoardMove: (todoId: string, newPkgId: string, newIndex: number) => void;
  editingTodo: Todo | null;
  handleSaveEdit: (id: string, updates: Partial<Todo>) => Promise<void>;
  showSwipeTutorial: boolean;
  dismissTutorial: () => void;
}

const MyTodosContent = ({
    viewMode, setViewMode,
    search, setSearch,
    filter, setFilter,
    sortBy, setSortBy,
    sortDirection, toggleSortDirection,
    categories, groupedTodos,
    sensors, handleDragEndLink,
    startEdit, handleBoardMove,
    editingTodo, handleSaveEdit,
    showSwipeTutorial, dismissTutorial
}: MyTodosContentProps) => {
    
    const sortedCategories = useTodoSorting({ categories, groupedTodos, sortBy, sortDirection });
    const [hoveredMode, setHoveredMode] = useState<ViewMode | null>(null);

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <h1>My Todos</h1>
               <div className="view-toggle">
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredMode('list')}
                    onMouseLeave={() => setHoveredMode(null)}
                  >
                      <LayoutList size={18} color={viewMode === 'list' ? 'white' : 'var(--text-muted)'} />
                      <AnimatePresence>
                        {(viewMode === 'list' || hoveredMode === 'list') && (
                          <motion.span
                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                          >
                            List
                          </motion.span>
                        )}
                      </AnimatePresence>
                  </button>
                  <button 
                    onClick={() => setViewMode('board')} 
                    className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredMode('board')}
                    onMouseLeave={() => setHoveredMode(null)}
                  >
                      <Kanban size={18} color={viewMode === 'board' ? 'white' : 'var(--text-muted)'} />
                      <AnimatePresence>
                        {(viewMode === 'board' || hoveredMode === 'board') && (
                          <motion.span
                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                          >
                            Move
                          </motion.span>
                        )}
                      </AnimatePresence>
                  </button>
               </div>
          </div>
          
          <div className="filter-bar">
            {/* Search Bar */}
            <div className="filter-chip">
              <Search />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '120px' }} />
            </div>
            {/* Filter */}
            <div className="filter-chip">
              <span className="chip-text">{filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Done'}</span>
              <ChevronDown size={14} className="chip-arrow" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as FilterStatus)}
                className="chip-select"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Done</option>
              </select>
              <Filter size={18} />

            </div>
            {/* Sort */}
            <div className="filter-chip">
              {/* {sortDirection === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />} */}
              <span className="chip-text">{sortBy === 'createdAt' ? 'Creation Date' : 'Due Date'}</span>
              <ChevronDown size={14} className="chip-arrow" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="chip-select"
              >
                <option value="createdAt">Creation Date</option>
                <option value="dueDate">Due Date</option>
              </select>
              <button onClick={toggleSortDirection} className="icon-btn sort-dir-btn" title={sortDirection === 'asc' ? "Ascending" : "Descending"}>
                  {sortDirection === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
              </button>
            </div>
          </div>
        </div>
  
        {/* ADD FORM */}
        <AddTodoForm categories={categories} />
  
        {/* EDIT MODAL */}
        <EditTodoModal 
            todo={editingTodo} 
            categories={categories} 
            onClose={() => startEdit(null)} 
            onSave={handleSaveEdit} 
        />
  
        {viewMode === 'list' ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndLink}>
              <div className="todo-sections">
              {Object.keys(groupedTodos).length === 0 && (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No todos found.
                  </div>
              )}
              
              {sortedCategories.map((cat) => {
                  const catTodos = groupedTodos[cat.id] || [];
                  if (catTodos.length === 0) return null; // Hide empty in list view
                  
                  return (
                  <div key={cat.id} style={{ marginBottom: '2.5rem' }}>
                      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                      {cat.name}
                      </h2>
                      <div className="todo-list">
                      <SortableContext items={catTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                          <AnimatePresence mode="popLayout">
                          {catTodos.map(todo => (
                              <SortableTodoItem key={todo.id} todo={todo} onEdit={startEdit} />
                          ))}
                          </AnimatePresence>
                      </SortableContext>
                      </div>
                  </div>
                  );
              })}
              </div>
          </DndContext>
        ) : (
            <TodoBoard 
              groupedTodos={groupedTodos} 
              categories={sortedCategories}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onEdit={startEdit} 
              onMoveTodo={handleBoardMove} 
            />
        )}
  
        <SwipeTutorial show={showSwipeTutorial} onDismiss={dismissTutorial} />
      </div>
    );
};

export default MyTodos;
