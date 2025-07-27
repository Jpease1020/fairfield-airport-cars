import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Container, H2, Text } from '@/components/ui';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * A reusable error boundary component that catches JavaScript errors
 * anywhere in the child component tree and displays a fallback UI
 * 
 * @example
 * ```tsx
 * <ErrorBoundary fallback={({ error, resetError }) => (
 *   <div>
 *     <h2>Something went wrong</h2>
 *     <button onClick={resetError}>Try again</button>
 *   </div>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <Container>
          <AlertTriangle  />
          <H2>
            Something went wrong
          </H2>
          <Text >
            An unexpected error occurred. Please try refreshing the page.
          </Text>
          <Button
            onClick={this.resetError}
          >
            Try again
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary }; 