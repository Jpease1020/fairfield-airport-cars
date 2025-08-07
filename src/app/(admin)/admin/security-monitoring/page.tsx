'use client';

import { useState, useEffect } from 'react';
import { Container, H2, Text, Button, Stack, Box, EditableText, Span } from '@/ui';
import { AdminPageWrapper } from '@/components/app';
import { Shield, AlertTriangle, Eye, RefreshCw, Lock, Unlock, User, Globe } from 'lucide-react';

interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'data_access' | 'payment' | 'api_call' | 'error' | 'threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export default function SecurityMonitoringPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    threats: 0,
    failures: 0,
    successful: 0
  });

  useEffect(() => {
    loadSecurityEvents();
  }, []);

  const loadSecurityEvents = async () => {
    try {
      setLoading(true);
      // TODO: Implement security event loading from the security monitoring service
      // For now, show mock data
      const mockEvents: SecurityEvent[] = [
        {
          type: 'authentication',
          severity: 'medium',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          userId: 'user123',
          sessionId: 'session456',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          action: 'login_attempt',
          resource: '/admin/login',
          details: { method: 'email', success: true },
          success: true
        },
        {
          type: 'threat',
          severity: 'high',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          userId: 'unknown',
          sessionId: 'session789',
          ipAddress: '203.0.113.45',
          userAgent: 'Mozilla/5.0 (compatible; Bot/1.0)',
          action: 'brute_force_attempt',
          resource: '/admin/login',
          details: { attempts: 15, blocked: true },
          success: false,
          errorMessage: 'Too many login attempts'
        },
        {
          type: 'payment',
          severity: 'high',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          userId: 'user456',
          sessionId: 'session101',
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
          action: 'payment_processing',
          resource: '/api/payment/process',
          details: { amount: 150.00, method: 'square' },
          success: true
        },
        {
          type: 'data_access',
          severity: 'low',
          timestamp: new Date(Date.now() - 10800000), // 3 hours ago
          userId: 'user789',
          sessionId: 'session202',
          ipAddress: '172.16.0.25',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          action: 'view_booking',
          resource: '/admin/bookings/123',
          details: { bookingId: '123', action: 'read' },
          success: true
        }
      ];
      setEvents(mockEvents);
      
      // Calculate stats
      const total = mockEvents.length;
      const threats = mockEvents.filter(e => e.type === 'threat').length;
      const failures = mockEvents.filter(e => !e.success).length;
      const successful = mockEvents.filter(e => e.success).length;
      
      setStats({ total, threats, failures, successful });
    } catch (error) {
      console.error('Failed to load security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearEvents = () => {
    if (!confirm('Are you sure you want to clear all security events?')) {
      return;
    }

    try {
      setEvents([]);
      setStats({ total: 0, threats: 0, failures: 0, successful: 0 });
      alert('Security events cleared successfully');
    } catch (error) {
      console.error('Failed to clear events:', error);
      alert('Failed to clear events');
    }
  };

  const getEventIcon = (event: SecurityEvent) => {
    switch (event.type) {
      case 'authentication':
        return event.success ? <Unlock size={16} /> : <Lock size={16} />;
      case 'threat':
        return <AlertTriangle size={16} color="red" />;
      case 'payment':
        return <Shield size={16} />;
      case 'data_access':
        return <Eye size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatIP = (ip?: string) => {
    if (!ip) return 'Unknown';
    // Mask IP for privacy
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.*.*`;
  };

  if (loading) {
    return (
      <AdminPageWrapper
        title="Security Monitoring"
        subtitle="Loading security data..."
      >
        <Container>
          <Text>
            <EditableText field="admin.securityMonitoring.loading" defaultValue="Loading...">
              Loading...
            </EditableText>
          </Text>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Security Monitoring"
      subtitle="Track and monitor security events"
    >
      <Container>
        <Stack direction="vertical" spacing="lg">
          {/* Header Actions */}
          <Box variant="elevated" padding="md">
            <H2>
              <EditableText field="admin.securityMonitoring.actions" defaultValue="Security Monitoring">
                Security Monitoring
              </EditableText>
            </H2>
            <Stack direction="horizontal" spacing="sm">
              <Button
                onClick={loadSecurityEvents}
                variant="outline"
              >
                <RefreshCw size={16} />
                <Span>
                  <EditableText field="admin.securityMonitoring.refresh" defaultValue="Refresh">
                    Refresh
                  </EditableText>
                </Span>
              </Button>
              <Button
                onClick={handleClearEvents}
                variant="danger"
                disabled={events.length === 0}
              >
                <Shield size={16} />
                <Span>
                  <EditableText field="admin.securityMonitoring.clear" defaultValue="Clear All">
                    Clear All
                  </EditableText>
                </Span>
              </Button>
            </Stack>
          </Box>

          {/* Security Stats */}
          <Box variant="elevated" padding="md">
            <H2>
              <EditableText field="admin.securityMonitoring.stats" defaultValue="Security Statistics">
                Security Statistics
              </EditableText>
            </H2>
            <Stack direction="horizontal" spacing="md">
              <Text size="sm">
                <EditableText field="admin.securityMonitoring.total" defaultValue="Total Events:">
                  Total Events:
                </EditableText>
                <Span variant="default"> {stats.total}</Span>
              </Text>
              <Text size="sm">
                <EditableText field="admin.securityMonitoring.threats" defaultValue="Threats:">
                  Threats:
                </EditableText>
                <Span variant="default"> {stats.threats}</Span>
              </Text>
              <Text size="sm">
                <EditableText field="admin.securityMonitoring.failures" defaultValue="Failures:">
                  Failures:
                </EditableText>
                <Span variant="default"> {stats.failures}</Span>
              </Text>
              <Text size="sm">
                <EditableText field="admin.securityMonitoring.successful" defaultValue="Successful:">
                  Successful:
                </EditableText>
                <Span variant="default"> {stats.successful}</Span>
              </Text>
            </Stack>
          </Box>

          {/* Security Events */}
          <Box variant="elevated" padding="md">
            <H2>
              <EditableText field="admin.securityMonitoring.events" defaultValue="Security Events">
                Security Events
              </EditableText>
            </H2>
            {events.length === 0 ? (
              <Text size="sm">
                <EditableText field="admin.securityMonitoring.noEvents" defaultValue="No security events recorded">
                  No security events recorded
                </EditableText>
              </Text>
            ) : (
              <Stack direction="vertical" spacing="sm">
                {events.map((event, index) => (
                  <Box key={index} variant="elevated" padding="sm">
                    <Stack direction="horizontal" spacing="sm" align="center">
                      {getEventIcon(event)}
                      <Stack direction="vertical" spacing="xs">
                        <Text size="sm" weight="semibold">
                          {event.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                        <Text size="xs">
                          <User size={12} />
                          <Span> {event.userId || 'Unknown'}</Span>
                          <Span> • </Span>
                          <Globe size={12} />
                          <Span> {formatIP(event.ipAddress)}</Span>
                          <Span> • </Span>
                          <Span> {new Date(event.timestamp).toLocaleString()}</Span>
                          <Span> • </Span>
                          <Span>
                            {event.severity} severity
                          </Span>
                        </Text>
                        <Text size="xs">
                          <Span> {event.resource}</Span>
                          <Span> • </Span>
                          <Span> {event.success ? 'Success' : 'Failed'}</Span>
                        </Text>
                      </Stack>
                      <Stack direction="horizontal" spacing="xs">
                        <Button
                          onClick={() => setSelectedEvent(event)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye size={14} />
                          <Span>
                            <EditableText field="admin.securityMonitoring.view" defaultValue="View">
                              View
                            </EditableText>
                          </Span>
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Event Details Modal */}
          {selectedEvent && (
            <Box variant="elevated" padding="md">
              <H2>
                <EditableText field="admin.securityMonitoring.details" defaultValue="Event Details">
                  Event Details
                </EditableText>
              </H2>
              <Stack direction="vertical" spacing="sm">
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.type" defaultValue="Type:">
                    Type:
                  </EditableText>
                  <Span variant="default"> {selectedEvent.type}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.action" defaultValue="Action:">
                    Action:
                  </EditableText>
                  <Span variant="default"> {selectedEvent.action}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.severity" defaultValue="Severity:">
                    Severity:
                  </EditableText>
                  <Span variant="default"> {selectedEvent.severity}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.timestamp" defaultValue="Timestamp:">
                    Timestamp:
                  </EditableText>
                  <Span variant="default"> {new Date(selectedEvent.timestamp).toLocaleString()}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.userId" defaultValue="User ID:">
                    User ID:
                  </EditableText>
                  <Span variant="default"> {selectedEvent.userId || 'Unknown'}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.sessionId" defaultValue="Session ID:">
                    Session ID:
                  </EditableText>
                  <Span variant="default"> {selectedEvent.sessionId}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.ipAddress" defaultValue="IP Address:">
                    IP Address:
                  </EditableText>
                  <Span variant="default"> {selectedEvent.ipAddress}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.resource" defaultValue="Resource:">
                    Resource:
                  </EditableText>
                  <Span variant="default"> {selectedEvent.resource}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.success" defaultValue="Success:">
                    Success:
                  </EditableText>
                  <Span variant="default"> {selectedEvent.success ? 'Yes' : 'No'}</Span>
                </Text>
                {selectedEvent.errorMessage && (
                  <Text size="sm">
                    <EditableText field="admin.securityMonitoring.error" defaultValue="Error:">
                      Error:
                    </EditableText>
                    <Span variant="default"> {selectedEvent.errorMessage}</Span>
                  </Text>
                )}
                <Text size="sm">
                  <EditableText field="admin.securityMonitoring.details" defaultValue="Details:">
                    Details:
                  </EditableText>
                </Text>
                <Box variant="elevated" padding="sm">
                  <Text size="xs" variant="muted">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </Text>
                </Box>
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="outline"
                  size="sm"
                >
                  <EditableText field="admin.securityMonitoring.close" defaultValue="Close">
                    Close
                  </EditableText>
                </Button>
              </Stack>
            </Box>
          )}

          {/* Status */}
          <Box variant="elevated" padding="sm">
            <Text size="sm" variant="muted">
              <EditableText field="admin.securityMonitoring.status" defaultValue="Last updated:">
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