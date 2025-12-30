import { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Card className="glass-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Something went wrong.</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
