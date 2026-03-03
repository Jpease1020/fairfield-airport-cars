'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Stack, Text, Button } from '@/design/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container>
          <Stack spacing="lg" align="center">
            <Text variant="lead" color="error">
              Something went wrong
            </Text>
            <Text>
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
            </Text>
            <Stack direction="horizontal" spacing="md">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"

              >
                Refresh Page
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"

              >
                Go Home
              </Button>
            </Stack>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}
