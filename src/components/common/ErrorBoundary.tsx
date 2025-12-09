'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Stack, Text, Button } from '@/design/ui';
import { CMSContext } from '@/design/providers/CMSDataProvider';

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
        <CMSContext.Consumer>
          {(cmsContext: { cmsData: any; isLoading: boolean } | undefined) => {
            const pageCmsData = cmsContext?.cmsData?.['error-boundary'] || {};
            return (
              <Container>
                <Stack spacing="lg" align="center">
                  <Text variant="lead" color="error" cmsId="error-boundary-title">
                    {pageCmsData?.['error-boundary-title'] || 'Something went wrong'}
                  </Text>
                  <Text cmsId="error-boundary-message">
                    {pageCmsData?.['error-boundary-message'] || "We're sorry, but something unexpected happened. Please try refreshing the page."}
                  </Text>
                  <Stack direction="horizontal" spacing="md">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="primary"
                      cmsId="error-boundary-refresh-button"
                    >
                      {pageCmsData?.['error-boundary-refresh-button'] || 'Refresh Page'}
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                      cmsId="error-boundary-home-button"
                    >
                      {pageCmsData?.['error-boundary-home-button'] || 'Go Home'}
                    </Button>
                  </Stack>
                </Stack>
              </Container>
            );
          }}
        </CMSContext.Consumer>
      );
    }

    return this.props.children;
  }
}
