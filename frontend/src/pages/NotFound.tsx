import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const NotFound = () => {
  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <Card className="glass-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', margin: 0, color: 'var(--primary)' }}>404</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          Page not found.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary" style={{ width: '100%' }}>
            Go Home
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
