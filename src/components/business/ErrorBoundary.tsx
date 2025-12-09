'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container } from '@/design/layout/containers/Container';
import { Text } from '@/design/components/base-components/text/Text';
import { Button } from '@/design/components/base-components/Button';
import { Stack } from '@/design/layout/framing/Stack';
import { CMSContext } from '@/design/providers/CMSDataProvider';

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
              </Container>
            );
          }}
        </CMSContext.Consumer>
      );
    }

    return this.props.children;
  }
} 