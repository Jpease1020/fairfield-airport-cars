'use client';

import { useState, useEffect } from 'react';
import { Container, H2, Text, Button, Stack, Box, Span } from '@/ui';
import { Shield, AlertTriangle, Eye, RefreshCw, Lock, Unlock, User, Globe } from 'lucide-react';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
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
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
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
    if (!confirm(getCMSField(cmsData, 'admin.securityMonitoring.confirmations.clearEvents', 'Are you sure you want to clear all security events?'))) {
      return;
    }

    try {
      setEvents([]);
      setStats({ total: 0, threats: 0, failures: 0, successful: 0 });
      alert(getCMSField(cmsData, 'admin.securityMonitoring.messages.eventsCleared', 'Security events cleared successfully'));
    } catch (error) {
      console.error('Failed to clear events:', error);
      alert(getCMSField(cmsData, 'admin.securityMonitoring.messages.clearFailed', 'Failed to clear events'));
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
    if (!ip) return getCMSField(cmsData, 'admin.securityMonitoring.ipAddress.unknown', 'Unknown');
    // Mask IP for privacy
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.*.*`;
  };

  if (loading) {
    return (
      <Container>
        <Text data-cms-id="admin.securityMonitoring.loading.message" mode={mode}>
          {getCMSField(cmsData, 'admin.securityMonitoring.loading.message', 'Loading...')}
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
            <H2 data-cms-id="admin.securityMonitoring.actions.title" mode={mode}>
              {getCMSField(cmsData, 'admin.securityMonitoring.actions.title', 'Security Monitoring')}
            </H2>
            <Stack direction="horizontal" spacing="sm">
              <Button
                onClick={loadSecurityEvents}
                variant="outline"
                data-cms-id="admin.securityMonitoring.actions.refresh"
                interactionMode={mode}
              >
                <RefreshCw size={16} />
                <Span>
                  {getCMSField(cmsData, 'admin.securityMonitoring.actions.refresh', 'Refresh')}
                </Span>
              </Button>
              <Button
                onClick={handleClearEvents}
                variant="danger"
                disabled={events.length === 0}
                data-cms-id="admin.securityMonitoring.actions.clearAll"
                interactionMode={mode}
              >
                <Shield size={16} />
                <Span>
                  {getCMSField(cmsData, 'admin.securityMonitoring.actions.clearAll', 'Clear All')}
                </Span>
              </Button>
            </Stack>
          </Box>

          {/* Security Stats */}
          <Box variant="elevated" padding="md">
            <H2 data-cms-id="admin.securityMonitoring.stats.title" mode={mode}>
              {getCMSField(cmsData, 'admin.securityMonitoring.stats.title', 'Security Statistics')}
            </H2>
            <Stack direction="horizontal" spacing="md">
              <Text size="sm" data-cms-id="admin.securityMonitoring.stats.total" mode={mode}>
                {getCMSField(cmsData, 'admin.securityMonitoring.stats.total', 'Total Events:')}
                <Span variant="default"> {stats.total}</Span>
              </Text>
              <Text size="sm" data-cms-id="admin.securityMonitoring.stats.threats" mode={mode}>
                {getCMSField(cmsData, 'admin.securityMonitoring.stats.threats', 'Threats:')}
                <Span variant="default"> {stats.threats}</Span>
              </Text>
              <Text size="sm" data-cms-id="admin.securityMonitoring.stats.failures" mode={mode}>
                {getCMSField(cmsData, 'admin.securityMonitoring.stats.failures', 'Failures:')}
                <Span variant="default"> {stats.failures}</Span>
              </Text>
              <Text size="sm" data-cms-id="admin.securityMonitoring.stats.successful" mode={mode}>
                {getCMSField(cmsData, 'admin.securityMonitoring.stats.successful', 'Successful:')}
                <Span variant="default"> {stats.successful}</Span>
              </Text>
            </Stack>
          </Box>

          {/* Security Events */}
          <Box variant="elevated" padding="md">
            <H2 data-cms-id="admin.securityMonitoring.events.title" mode={mode}>
              {getCMSField(cmsData, 'admin.securityMonitoring.events.title', 'Security Events')}
            </H2>
            {events.length === 0 ? (
              <Text size="sm" data-cms-id="admin.securityMonitoring.events.noEvents" mode={mode}>
                {getCMSField(cmsData, 'admin.securityMonitoring.events.noEvents', 'No security events recorded')}
              </Text>
            ) : (
              <Stack direction="vertical" spacing="sm">
                {events.map((event, index) => (
                  <Box key={index} variant="elevated" padding="sm">
                    <Stack direction="horizontal" spacing="sm" align="center">
                      {getEventIcon(event)}
                      <Stack direction="vertical" spacing="xs">
                        <Text size="sm" weight="semibold" data-cms-id="admin.securityMonitoring.events.action" mode={mode}>
                          {event.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                        <Text size="xs" data-cms-id="admin.securityMonitoring.events.details" mode={mode}>
                          <User size={12} />
                          <Span> {event.userId || getCMSField(cmsData, 'admin.securityMonitoring.events.unknownUser', 'Unknown')}</Span>
                          <Span> • </Span>
                          <Globe size={12} />
                          <Span> {formatIP(event.ipAddress)}</Span>
                          <Span> • </Span>
                          <Span> {new Date(event.timestamp).toLocaleString()}</Span>
                          <Span> • </Span>
                          <Span>
                            {event.severity} {getCMSField(cmsData, 'admin.securityMonitoring.events.severity', 'severity')}
                          </Span>
                        </Text>
                        <Text size="xs" data-cms-id="admin.securityMonitoring.events.status" mode={mode}>
                          <Span> {event.resource}</Span>
                          <Span> • </Span>
                          <Span> {event.success ? getCMSField(cmsData, 'admin.securityMonitoring.events.success', 'Success') : getCMSField(cmsData, 'admin.securityMonitoring.events.failed', 'Failed')}</Span>
                        </Text>
                      </Stack>
                      <Stack direction="horizontal" spacing="xs">
                        <Button
                          onClick={() => setSelectedEvent(event)}
                          variant="outline"
                          size="sm"
                          data-cms-id="admin.securityMonitoring.events.viewButton"
                          interactionMode={mode}
                        >
                          <Eye size={14} />
                          <Span>
                            {getCMSField(cmsData, 'admin.securityMonitoring.events.viewButton', 'View')}
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
              <H2 data-cms-id="admin.securityMonitoring.details.title" mode={mode}>
                {getCMSField(cmsData, 'admin.securityMonitoring.details.title', 'Event Details')}
              </H2>
              <Stack direction="vertical" spacing="sm">
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.type" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.type', 'Type:')}
                  <Span variant="default"> {selectedEvent.type}</Span>
                </Text>
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.action" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.action', 'Action:')}
                  <Span variant="default"> {selectedEvent.action}</Span>
                </Text>
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.severity" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.severity', 'Severity:')}
                  <Span variant="default"> {selectedEvent.severity}</Span>
                </Text>
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.timestamp" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.timestamp', 'Timestamp:')}
                  <Span variant="default"> {new Date(selectedEvent.timestamp).toLocaleString()}</Span>
                </Text>
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.userId" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.userId', 'User ID:')}
                  <Span variant="default"> {selectedEvent.userId || getCMSField(cmsData, 'admin.securityMonitoring.events.unknownUser', 'Unknown')}</Span>
                </Text>
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.sessionId" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.sessionId', 'Session ID:')}
                  <Span variant="default"> {selectedEvent.sessionId}</Span>
                </Text>
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.ipAddress" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.ipAddress', 'IP Address:')}
                  <Span variant="default"> {selectedEvent.ipAddress}</Span>
                </Text>
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.resource" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.resource', 'Resource:')}
                  <Span variant="default"> {selectedEvent.resource}</Span>
                </Text>
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.success" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.success', 'Success:')}
                  <Span variant="default"> {selectedEvent.success ? getCMSField(cmsData, 'admin.securityMonitoring.events.success', 'Yes') : getCMSField(cmsData, 'admin.securityMonitoring.events.failed', 'No')}</Span>
                </Text>
                {selectedEvent.errorMessage && (
                  <Text size="sm" data-cms-id="admin.securityMonitoring.details.error" mode={mode}>
                    {getCMSField(cmsData, 'admin.securityMonitoring.details.error', 'Error:')}
                    <Span variant="default"> {selectedEvent.errorMessage}</Span>
                  </Text>
                )}
                <Text size="sm" data-cms-id="admin.securityMonitoring.details.details" mode={mode}>
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.details', 'Details:')}
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
                  data-cms-id="admin.securityMonitoring.details.closeButton"
                  interactionMode={mode}
                >
                  {getCMSField(cmsData, 'admin.securityMonitoring.details.closeButton', 'Close')}
                </Button>
              </Stack>
            </Box>
          )}

          {/* Status */}
          <Box variant="elevated" padding="sm">
            <Text size="sm" variant="muted">
              {getCMSField(cmsData, 'admin.securityMonitoring.status', 'Last updated:')}
              <Span> {new Date().toLocaleString()}</Span>
            </Text>
          </Box>
        </Stack>
      </Container>
    </>
  );
} 