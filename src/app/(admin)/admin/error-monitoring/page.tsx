'use client';

import { useState, useEffect } from 'react';
import { Container, H2, Text, Button, Stack, Box, EditableText, Span } from '@/ui';
import { AdminPageWrapper } from '@/components/app';
import { AlertTriangle, XCircle, RefreshCw, Trash2, Eye, AlertCircle } from 'lucide-react';

interface ErrorEvent {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export default function ErrorMonitoringPage() {
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
      <AdminPageWrapper
        title="Error Monitoring"
        subtitle="Loading error data..."
      >
        <Container>
          <Text>
            <EditableText field="admin.errorMonitoring.loading" defaultValue="Loading...">
              Loading...
            </EditableText>
          </Text>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Error Monitoring"
      subtitle="Track and manage application errors"
    >
      <Container>
        <Stack direction="vertical" spacing="lg">
          {/* Header Actions */}
          <Box variant="elevated" padding="md">
            <H2>
              <EditableText field="admin.errorMonitoring.actions" defaultValue="Error Monitoring">
                Error Monitoring
              </EditableText>
            </H2>
            <Stack direction="horizontal" spacing="sm">
              <Button
                onClick={loadErrors}
                variant="outline"
              >
                <RefreshCw size={16} />
                <Span>
                  <EditableText field="admin.errorMonitoring.refresh" defaultValue="Refresh">
                    Refresh
                  </EditableText>
                </Span>
              </Button>
              <Button
                onClick={handleClearErrors}
                variant="danger"
                disabled={errors.length === 0}
              >
                <Trash2 size={16} />
                <Span>
                  <EditableText field="admin.errorMonitoring.clear" defaultValue="Clear All">
                    Clear All
                  </EditableText>
                </Span>
              </Button>
            </Stack>
          </Box>

          {/* Error Summary */}
          <Box variant="elevated" padding="md">
            <H2>
              <EditableText field="admin.errorMonitoring.summary" defaultValue="Error Summary">
                Error Summary
              </EditableText>
            </H2>
            <Stack direction="horizontal" spacing="md">
              <Text size="sm">
                <EditableText field="admin.errorMonitoring.total" defaultValue="Total Errors:">
                  Total Errors:
                </EditableText>
                <Span variant="default"> {errorCount}</Span>
              </Text>
              <Text size="sm">
                <EditableText field="admin.errorMonitoring.high" defaultValue="High Severity:">
                  High Severity:
                </EditableText>
                <Span variant="default"> {errors.filter(e => getErrorSeverity(e) === 'high').length}</Span>
              </Text>
              <Text size="sm">
                <EditableText field="admin.errorMonitoring.medium" defaultValue="Medium Severity:">
                  Medium Severity:
                </EditableText>
                <Span variant="default"> {errors.filter(e => getErrorSeverity(e) === 'medium').length}</Span>
              </Text>
            </Stack>
          </Box>

          {/* Error List */}
          <Box variant="elevated" padding="md">
            <H2>
              <EditableText field="admin.errorMonitoring.list" defaultValue="Recent Errors">
                Recent Errors
              </EditableText>
            </H2>
            {errors.length === 0 ? (
              <Text variant="muted" size="sm">
                <EditableText field="admin.errorMonitoring.noErrors" defaultValue="No errors recorded">
                  No errors recorded
                </EditableText>
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
                              <EditableText field="admin.errorMonitoring.view" defaultValue="View">
                                View
                              </EditableText>
                            </Span>
                          </Button>
                          <Button
                            onClick={() => handleDeleteError(index)}
                            variant="danger"
                            size="sm"
                          >
                            <Trash2 size={14} />
                            <Span>
                              <EditableText field="admin.errorMonitoring.delete" defaultValue="Delete">
                                Delete
                              </EditableText>
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
                <EditableText field="admin.errorMonitoring.details" defaultValue="Error Details">
                  Error Details
                </EditableText>
              </H2>
              <Stack direction="vertical" spacing="sm">
                <Text size="sm">
                  <EditableText field="admin.errorMonitoring.message" defaultValue="Message:">
                    Message:
                  </EditableText>
                  <Span variant="default"> {selectedError.message}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.errorMonitoring.url" defaultValue="URL:">
                    URL:
                  </EditableText>
                  <Span variant="default"> {selectedError.url}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.errorMonitoring.timestamp" defaultValue="Timestamp:">
                    Timestamp:
                  </EditableText>
                  <Span variant="default"> {new Date(selectedError.timestamp).toLocaleString()}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.errorMonitoring.userAgent" defaultValue="User Agent:">
                    User Agent:
                  </EditableText>
                  <Span variant="default"> {selectedError.userAgent}</Span>
                </Text>
                {selectedError.context && (
                  <Text size="sm">
                    <EditableText field="admin.errorMonitoring.context" defaultValue="Context:">
                      Context:
                    </EditableText>
                    <Span variant="default"> {JSON.stringify(selectedError.context, null, 2)}</Span>
                  </Text>
                )}
                <Text size="sm">
                  <EditableText field="admin.errorMonitoring.stack" defaultValue="Stack Trace:">
                    Stack Trace:
                  </EditableText>
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
                  <EditableText field="admin.errorMonitoring.close" defaultValue="Close">
                    Close
                  </EditableText>
                </Button>
              </Stack>
            </Box>
          )}

          {/* Status */}
          <Box variant="elevated" padding="sm">
            <Text size="sm" variant="muted">
              <EditableText field="admin.errorMonitoring.status" defaultValue="Last updated:">
                Last updated:
              </EditableText>
              <Span> {new Date().toLocaleString()}</Span>
            </Text>
          </Box>
        </Stack>
      </Container>
    </AdminPageWrapper>
  );
} 