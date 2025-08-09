'use client';

import { useState, useEffect } from 'react';
import { Container, H2, Text, Button, Stack, Box, Span } from '@/ui';
import { AlertTriangle, XCircle, RefreshCw, Trash2, Eye, AlertCircle } from 'lucide-react';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';
interface ErrorEvent {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: Date;
  context?: Record<string, any>;
}




export default function ErrorMonitoringPage() {
  const { cmsData } = useCMSData();
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    try {
      setLoading(true);
      // TODO: Implement error loading from the error monitoring service
      // For now, show mock data
      const mockErrors: ErrorEvent[] = [
        {
          message: 'Failed to load booking data',
          stack: 'Error: Failed to fetch\n    at loadBookings (booking-service.ts:45)\n    at useEffect (page.tsx:23)',
          url: '/admin/bookings',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          context: { userId: 'user123', action: 'load_bookings' }
        },
        {
          message: 'Payment processing failed',
          stack: 'Error: Square API error\n    at processPayment (payment-service.ts:67)\n    at handlePayment (checkout.tsx:89)',
          url: '/book/payment',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          context: { bookingId: 'booking456', amount: 150.00 }
        },
        {
          message: 'Google Maps API error',
          stack: 'Error: Places API quota exceeded\n    at loadPlaces (maps-service.ts:23)\n    at autocomplete (booking-form.tsx:45)',
          url: '/book',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 10800000), // 3 hours ago
          context: { apiKey: 'gmaps_key_123', quota: 'exceeded' }
        }
      ];
      setErrors(mockErrors);
      setErrorCount(mockErrors.length);
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearErrors = () => {
    if (!confirm('Are you sure you want to clear all errors?')) {
      return;
    }

    try {
      setErrors([]);
      setErrorCount(0);
      alert('Errors cleared successfully');
    } catch (error) {
      console.error('Failed to clear errors:', error);
      alert('Failed to clear errors');
    }
  };

  const handleDeleteError = (index: number) => {
    try {
      const newErrors = errors.filter((_, i) => i !== index);
      setErrors(newErrors);
      setErrorCount(newErrors.length);
    } catch (error) {
      console.error('Failed to delete error:', error);
      alert('Failed to delete error');
    }
  };

  const getErrorSeverity = (error: ErrorEvent) => {
    const message = error.message.toLowerCase();
    if (message.includes('payment') || message.includes('api')) return 'high';
    if (message.includes('fetch') || message.includes('network')) return 'medium';
    return 'low';
  };

  const getErrorIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle size={16} color="red" />;
      case 'medium':
        return <AlertCircle size={16} color="orange" />;
      default:
        return <XCircle size={16} color="gray" />;
    }
  };

  const formatStack = (stack?: string) => {
    if (!stack) return 'No stack trace available';
    return stack.split('\n').slice(0, 5).join('\n') + '...';
  };

  if (loading) {
    return (
      
        <Container>
          <Text>
            {getCMSField(cmsData, 'admin.errorMonitoring.loading', 'Loading...')}
          </Text>
        </Container>
      
    );
  }

  return (
    <>
      <Container>
        <Stack direction="vertical" spacing="lg">
          {/* Header Actions */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.errorMonitoring.actions', 'Error Monitoring')}
            </H2>
            <Stack direction="horizontal" spacing="sm">
              <Button
                onClick={loadErrors}
                variant="outline"
              >
                <RefreshCw size={16} />
                <Span>
                  {getCMSField(cmsData, 'admin.errorMonitoring.refresh', 'Refresh')}
                </Span>
              </Button>
              <Button
                onClick={handleClearErrors}
                variant="danger"
                disabled={errors.length === 0}
              >
                <Trash2 size={16} />
                <Span>
                  {getCMSField(cmsData, 'admin.errorMonitoring.clear', 'Clear All')}
                </Span>
              </Button>
            </Stack>
          </Box>

          {/* Error Summary */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.errorMonitoring.summary', 'Error Summary')}
            </H2>
            <Stack direction="horizontal" spacing="md">
              <Text size="sm">
                {getCMSField(cmsData, 'admin.errorMonitoring.total', 'Total Errors:')}
                <Span variant="default"> {errorCount}</Span>
              </Text>
              <Text size="sm">
                {getCMSField(cmsData, 'admin.errorMonitoring.high', 'High Severity:')}
                <Span variant="default"> {errors.filter(e => getErrorSeverity(e) === 'high').length}</Span>
              </Text>
              <Text size="sm">
                {getCMSField(cmsData, 'admin.errorMonitoring.medium', 'Medium Severity:')}
                <Span variant="default"> {errors.filter(e => getErrorSeverity(e) === 'medium').length}</Span>
              </Text>
            </Stack>
          </Box>

          {/* Error List */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.errorMonitoring.list', 'Recent Errors')}
            </H2>
            {errors.length === 0 ? (
              <Text variant="muted" size="sm">
                {getCMSField(cmsData, 'admin.errorMonitoring.noErrors', 'No errors recorded')}
              </Text>
            ) : (
              <Stack direction="vertical" spacing="sm">
                {errors.map((error, index) => {
                  const severity = getErrorSeverity(error);
                  return (
                    <Box key={index} variant="elevated" padding="sm">
                      <Stack direction="horizontal" spacing="sm" align="center">
                        {getErrorIcon(severity)}
                        <Stack direction="vertical" spacing="xs" >
                          <Text size="sm" weight="semibold">
                            {error.message}
                          </Text>
                          <Text size="xs" variant="muted">
                            <Span> {error.url}</Span>
                            <Span> • </Span>
                            <Span> {new Date(error.timestamp).toLocaleString()}</Span>
                            <Span> • </Span>
                            <Span> {severity} severity</Span>
                          </Text>
                        </Stack>
                        <Stack direction="horizontal" spacing="xs">
                          <Button
                            onClick={() => setSelectedError(error)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye size={14} />
                            <Span>
                              {getCMSField(cmsData, 'admin.errorMonitoring.view', 'View')}
                            </Span>
                          </Button>
                          <Button
                            onClick={() => handleDeleteError(index)}
                            variant="danger"
                            size="sm"
                          >
                            <Trash2 size={14} />
                            <Span>
                              {getCMSField(cmsData, 'admin.errorMonitoring.delete', 'Delete')}
                            </Span>
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Error Details Modal */}
          {selectedError && (
            <Box variant="elevated" padding="md">
              <H2>
                {getCMSField(cmsData, 'admin.errorMonitoring.details', 'Error Details')}
              </H2>
              <Stack direction="vertical" spacing="sm">
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.errorMonitoring.message', 'Message:')}
                  <Span variant="default"> {selectedError.message}</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.errorMonitoring.url', 'URL:')}
                  <Span variant="default"> {selectedError.url}</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.errorMonitoring.timestamp', 'Timestamp:')}
                  <Span variant="default"> {new Date(selectedError.timestamp).toLocaleString()}</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.errorMonitoring.userAgent', 'User Agent:')}
                  <Span variant="default"> {selectedError.userAgent}</Span>
                </Text>
                {selectedError.context && (
                  <Text size="sm">
                    {getCMSField(cmsData, 'admin.errorMonitoring.context', 'Context:')}
                    <Span variant="default"> {JSON.stringify(selectedError.context, null, 2)}</Span>
                  </Text>
                )}
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.errorMonitoring.stack', 'Stack Trace:')}
                </Text>
                <Box variant="elevated" padding="sm">
                  <Text size="xs" variant="muted">
                    {formatStack(selectedError.stack)}
                  </Text>
                </Box>
                <Button
                  onClick={() => setSelectedError(null)}
                  variant="outline"
                  size="sm"
                >
                  {getCMSField(cmsData, 'admin.errorMonitoring.close', 'Close')}
                </Button>
              </Stack>
            </Box>
          )}

          {/* Status */}
          <Box variant="elevated" padding="sm">
            <Text size="sm" variant="muted">
              {getCMSField(cmsData, 'admin.errorMonitoring.status', 'Last updated:')}
              <Span> {new Date().toLocaleString()}</Span>
            </Text>
          </Box>
        </Stack>
      </Container>
    </>
  );
} 