import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy Load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyTodos = lazy(() => import('./pages/MyTodos'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading Fallback Component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    width: '100%',
  }}>
    <div className="loading-spinner" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard shows overview/stats */}
          <Route index element={<Dashboard />} />
          {/* MyTodos shows full task list */}
          <Route path="todos" element={<MyTodos />} />
          <Route path="categories" element={<CategoriesPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;