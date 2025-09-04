'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container } from '@/design/layout/containers/Container';
import { Text } from '@/design/components/base-components/text/Text';
import { Button } from '@/design/components/base-components/Button';
import { Stack } from '@/design/layout/framing/Stack';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Error logging could be implemented here
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container>
          <Stack spacing="lg" align="center">
            <Text variant="lead" color="error" cmsId="error-boundary-title">
              Something went wrong
            </Text>
            <Text cmsId="error-boundary-message">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
            </Text>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              cmsId="error-boundary-refresh-button"
              text="Refresh Page"
            />
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              cmsId="error-boundary-home-button"
              text="Go Home"
            />
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
} 