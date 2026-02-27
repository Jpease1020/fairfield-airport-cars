'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Text, Box, Button, Alert, LoadingSpinner, H1 } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';

type CheckStatus = 'pass' | 'fail' | 'warning';
type HealthCheck = { status: CheckStatus; message: string; duration?: number };

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  checks: Record<string, HealthCheck>;
  summary: { total: number; passed: number; warnings: number; failed: number };
  totalDuration: number;
}

const statusColor: Record<CheckStatus, string> = {
  pass: '#059669',
  fail: '#dc2626',
  warning: '#d97706',
};

const statusLabel: Record<CheckStatus, string> = {
  pass: 'OK',
  fail: 'Fail',
  warning: 'Warning',
};

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/health');
      if (!res.ok) throw new Error('Health check failed');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load health');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading && !data) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner />
          <Text>Running health checks…</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        <Stack direction="horizontal" spacing="md" align="center" justify="space-between">
          <H1>Health</H1>
          <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading} text={loading ? 'Refreshing…' : 'Refresh'} />
        </Stack>
        <Text size="sm" color="secondary">
          Service and config checks. Admin-only — do not share this page.
        </Text>

        {error && <Alert variant="error">{error}</Alert>}

        {data && (
          <>
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" spacing="md" align="center">
                  <Text weight="bold">Overall</Text>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      background: data.status === 'healthy' ? '#d1fae5' : data.status === 'degraded' ? '#fef3c7' : '#fee2e2',
                      color: data.status === 'healthy' ? '#065f46' : data.status === 'degraded' ? '#92400e' : '#991b1b',
                    }}
                  >
                    {data.status}
                  </span>
                  <Text size="sm" color="secondary">
                    {data.timestamp} · {data.environment} · {data.totalDuration}ms
                  </Text>
                </Stack>
                <Text size="sm">
                  Passed: {data.summary.passed} · Warnings: {data.summary.warnings} · Failed: {data.summary.failed}
                </Text>
              </Stack>
            </Box>

            <Box variant="outlined" padding="md">
              <Text weight="bold" marginBottom="md">Checks</Text>
              <Stack spacing="sm">
                {Object.entries(data.checks).map(([name, check]) => (
                  <Stack key={name} direction="horizontal" spacing="md" align="center" style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                    <Text as="span" weight="medium" style={{ minWidth: 180 }}>
                      {name}
                    </Text>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: statusColor[check.status],
                      }}
                    >
                      {statusLabel[check.status]}
                    </span>
                    <Text as="span" size="sm" color="secondary">
                      {check.message}
                      {check.duration != null && ` (${check.duration}ms)`}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}
