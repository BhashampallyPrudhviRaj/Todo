import { NavLink, Outlet } from 'react-router-dom';
import { ListTodo, Tag, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="logo">
          <img src="/logo_todo.png" alt="Todo Logo" style={{ width: '32px', height: '32px' }} />
          <span>Todo</span>
        </div>
        
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/todos" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <ListTodo size={20} />
            My Todos
          </NavLink>
          
          <NavLink 
            to="/categories" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Tag size={20} />
            Categories
          </NavLink>
        </div>
      </nav>

      <nav className="mobile-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={24} />
        </NavLink>
        
        <NavLink 
          to="/todos" 
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <ListTodo size={24} />
        </NavLink>
        
        <NavLink 
          to="/categories" 
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <Tag size={24} />
        </NavLink>
      </nav>

      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
