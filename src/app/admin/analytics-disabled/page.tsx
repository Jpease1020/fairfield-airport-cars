'use client';

import React, { useState, useEffect } from 'react';
import { Container, Text, Span, H2, H1, H3 } from '@/components/ui';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { GridSection, StatCard } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/components/admin/AdminProvider';

interface AnalyticsData {
  totalInteractions: number;
  totalErrors: number;
  interactionTypes: Record<string, number>;
  errorTypes: Record<string, number>;
  elementTypes: Record<string, number>;
  recentErrors: any[];
  recentInteractions: any[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/summary');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopInteractions = () => {
    if (!analytics) return [];
    return Object.entries(analytics.interactionTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopErrors = () => {
    if (!analytics) return [];
    return Object.entries(analytics.errorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopElements = () => {
    if (!analytics) return [];
    return Object.entries(analytics.elementTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <Container>
        <Text>🔄 Loading analytics...</Text>
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="vertical" spacing="md">
        <H1>Analytics Dashboard</H1>
        <Text>User interactions, errors, and performance metrics</Text>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <Span>🔄</Span>
          Refresh
        </Button>
      </Stack>
      
      {lastUpdated && (
        <Container>
          <Text>Last updated: {lastUpdated.toLocaleString()}</Text>
        </Container>
      )}

      <Container>
        {!analytics ? (
          <Stack direction="vertical" spacing="md" align="center">
            <Span>⚠️</Span>
            <H3>No Analytics Data</H3>
            <Text>Analytics data will appear here once users start interacting with the app.</Text>
          </Stack>
        ) : (
          <Container>
            {/* Overview Cards */}
            <Stack direction="horizontal" spacing="md">
              <StatCard
                title="Total Interactions"
                value={analytics.totalInteractions.toLocaleString()}
                description="All user interactions tracked"
                icon="📊"
              />

              <StatCard
                title="Total Errors"
                value={analytics.totalErrors.toLocaleString()}
                description="Errors detected and tracked"
                icon="⚠️"
              />

              <StatCard
                title="Error Rate"
                value={`${analytics.totalInteractions > 0 
                  ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(2)
                  : '0'
                }%`}
                description="Percentage of interactions with errors"
                icon="📉"
              />

              <StatCard
                title="Active Elements"
                value={Object.keys(analytics.elementTypes).length.toString()}
                description="Different element types tracked"
                icon="🖱️"
              />
            </Stack>

            {/* Detailed Metrics */}
            <Container>
              {/* Top Interaction Types */}
              <Stack spacing="md">
                <H2>
                  <Span>🖱️</Span>
                  Top Interaction Types
                </H2>
                <Stack direction="vertical" spacing="sm">
                  {getTopInteractions().map(([type, count]) => (
                    <Stack key={type} direction="horizontal" justify="between" align="center">
                      <div className="flex items-center gap-2">
                        <Span>●</Span>
                        <Span>
                          {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </Span>
                      </div>
                      <Span>
                        {count.toLocaleString()}
                      </Span>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              {/* Top Error Types */}
              <Container>
                <H2>
                  <Span>⚠️</Span>
                  Top Error Types
                </H2>
                <Stack direction="vertical" spacing="sm">
                  {getTopErrors().map(([type, count]) => (
                    <Stack key={type} direction="horizontal" justify="between" align="center">
                      <Span>● {type.replace(/([A-Z])/g, ' $1').toLowerCase()}</Span>
                      <Span>{count.toLocaleString()}</Span>
                    </Stack>
                  ))}
                </Stack>
              </Container>

              {/* Top Element Types */}
              <Container>
                <H2>
                  <Span>📝</Span>
                  Most Interacted Elements
                </H2>
                <Stack direction="vertical" spacing="sm">
                  {getTopElements().map(([element, count]) => (
                    <Stack key={element} direction="horizontal" justify="between" align="center">
                      <Span>● {element}</Span>
                      <Span>{count.toLocaleString()}</Span>
                    </Stack>
                  ))}
                </Stack>
              </Container>

              {/* Recent Activity */}
              <Container>
                <H2>
                  <Span>⏰</Span>
                  Recent Activity
                </H2>
                <Stack direction="vertical" spacing="sm">
                  {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
                    <Stack key={index} direction="horizontal" justify="between" align="center">
                      <Span>● {interaction.type} on {interaction.element}</Span>
                      <Span>{new Date(interaction.timestamp).toLocaleTimeString()}</Span>
                    </Stack>
                  ))}
                </Stack>
              </Container>
            </Container>

            {/* Recent Errors */}
            {analytics.recentErrors.length > 0 && (
              <Container>
                <H2>
                  <Span>⚠️</Span>
                  Recent Errors
                </H2>
                <Stack direction="vertical" spacing="md">
                  {analytics.recentErrors.slice(0, 10).map((error, index) => (
                    <Container key={index}>
                      <Stack direction="horizontal" justify="between" align="center">
                        <Span>{error.message}</Span>
                        <Span>{new Date(error.timestamp).toLocaleString()}</Span>
                      </Stack>
                      <Text>Type: {error.type} • Page: {error.page}</Text>
                    </Container>
                  ))}
                </Stack>
              </Container>
            )}
          </Container>
        )}
      </Container>
    </Container>
  );
} 