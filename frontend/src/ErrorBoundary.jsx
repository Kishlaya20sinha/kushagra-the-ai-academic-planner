import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Dashboard error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '600px', margin: '4rem auto', padding: '2rem',
          background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
          borderRadius: '12px', textAlign: 'center', color: '#fca5a5'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
            {this.state.error?.message || 'An unexpected error occurred rendering the dashboard.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '10px 24px', background: '#6366f1', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
