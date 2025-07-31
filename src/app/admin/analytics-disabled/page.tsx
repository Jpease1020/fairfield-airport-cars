'use client';

import React, { useState, useEffect } from 'react';
import { Container, H2, Text, Span } from '@/ui';
import { EditableText } from '@/ui';
import { EditableHeading } from '@/ui';
import { Stack } from '@/ui';
import { Button } from '@/ui';
import { ContentBox } from '@/ui';

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
        <EditableText field="admin.analytics.loading" defaultValue="🔄 Loading analytics...">
          🔄 Loading analytics...
        </EditableText>
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="vertical" spacing="md">
        <EditableHeading field="admin.analytics.title" defaultValue="Analytics Dashboard">
          Analytics Dashboard
        </EditableHeading>
        <EditableText field="admin.analytics.userInteractions.description" defaultValue="User interactions, errors, and performance metrics">
          User interactions, errors, and performance metrics
        </EditableText>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <Span>🔄</Span>
          <EditableText field="admin.analytics.refreshButton" defaultValue="Refresh">
            Refresh
          </EditableText>
        </Button>
      </Stack>
      
      {lastUpdated && (
        <Container>
          <EditableText field="admin.analytics.lastUpdated" defaultValue={`Last updated: ${lastUpdated.toLocaleString()}`}>
            Last updated: {lastUpdated.toLocaleString()}
          </EditableText>
        </Container>
      )}

      <Container>
        {!analytics ? (
          <Stack direction="vertical" spacing="md" align="center">
            <Span>⚠️</Span>
            <EditableHeading field="admin.analytics.noData.title" defaultValue="No Analytics Data">
              No Analytics Data
            </EditableHeading>
            <EditableText field="admin.analytics.noData.message" defaultValue="Analytics data will appear here once users start interacting with the app.">
              Analytics data will appear here once users start interacting with the app.
            </EditableText>
          </Stack>
        ) : (
          <Container>
            {/* Overview Cards */}
            <Stack direction="horizontal" spacing="md">
              <ContentBox variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Text size="lg" weight="bold">📊 Total Interactions</Text>
                  <Text size="xl" weight="bold">{analytics.totalInteractions.toLocaleString()}</Text>
                  <Text>All user interactions tracked</Text>
                </Stack>
              </ContentBox>

              <ContentBox variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Text size="lg" weight="bold">⚠️ Total Errors</Text>
                  <Text size="xl" weight="bold">{analytics.totalErrors.toLocaleString()}</Text>
                  <Text>Errors detected and tracked</Text>
                </Stack>
              </ContentBox>

              <ContentBox variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Text size="lg" weight="bold">📉 Error Rate</Text>
                  <Text size="xl" weight="bold">{`${analytics.totalInteractions > 0 
                    ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(2)
                    : '0'
                  }%`}</Text>
                  <Text>Percentage of interactions with errors</Text>
                </Stack>
              </ContentBox>

              <ContentBox variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Text size="lg" weight="bold">🖱️ Active Elements</Text>
                  <Text size="xl" weight="bold">{Object.keys(analytics.elementTypes).length.toString()}</Text>
                  <Text>Different element types tracked</Text>
                </Stack>
              </ContentBox>
            </Stack>

            {/* Detailed Metrics */}
            <Container>
              {/* Top Interaction Types */}
              <Container>
                <H2>
                  <Span>🖱️</Span>
                  <EditableText field="admin.analytics.topInteractionTypes" defaultValue="Top Interaction Types">
                    Top Interaction Types
                  </EditableText>
                </H2>
                <Container>
                  {getTopInteractions().map(([type, count]) => (
                    <Container key={type}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span>● {type.replace(/([A-Z])/g, ' $1').toLowerCase()}</Span>
                        <Span>
                          {count.toLocaleString()}
                        </Span>
                      </Stack>
                    </Container>
                  ))}
                </Container>
              </Container>

              {/* Top Error Types */}
              <Container>
                <H2>
                  <Span>⚠️</Span>
                  <EditableText field="admin.analytics.topErrorTypes" defaultValue="Top Error Types">
                    Top Error Types
                  </EditableText>
                </H2>
                <Container>
                  {getTopErrors().map(([type, count]) => (
                    <Container key={type}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span>● {type.replace(/([A-Z])/g, ' $1').toLowerCase()}</Span>
                        <Span>{count.toLocaleString()}</Span>
                      </Stack>
                    </Container>
                  ))}
                </Container>
              </Container>

              {/* Top Element Types */}
              <Container>
                <H2>
                  <Span>📝</Span>
                  <EditableText field="admin.analytics.mostInteractedElements" defaultValue="Most Interacted Elements">
                    Most Interacted Elements
                  </EditableText>
                </H2>
                <Container>
                  {getTopElements().map(([element, count]) => (
                    <Container key={element}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span>● {element}</Span>
                        <Span>{count.toLocaleString()}</Span>
                      </Stack>
                    </Container>
                  ))}
                </Container>
              </Container>

              {/* Recent Activity */}
              <Container>
                <H2>
                  <Span>⏰</Span>
                  <EditableText field="admin.analytics.recentActivity" defaultValue="Recent Activity">
                    Recent Activity
                  </EditableText>
                </H2>
                <Container>
                  {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
                    <Container key={index}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span>● {interaction.type} on {interaction.element}</Span>
                        <Span>{new Date(interaction.timestamp).toLocaleTimeString()}</Span>
                      </Stack>
                    </Container>
                  ))}
                </Container>
              </Container>
            </Container>

            {/* Recent Errors */}
            {analytics.recentErrors.length > 0 && (
              <Container>
                <H2>
                  <Span>⚠️</Span>
                  <EditableText field="admin.analytics.recentErrors" defaultValue="Recent Errors">
                    Recent Errors
                  </EditableText>
                </H2>
                <Container>
                  {analytics.recentErrors.slice(0, 10).map((error, index) => (
                    <Container key={index}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span>{error.message}</Span>
                        <Span>{new Date(error.timestamp).toLocaleString()}</Span>
                      </Stack>
                      <Text>
                        <EditableText field="admin.analytics.errorDetails" defaultValue={`Type: ${error.type} • Page: ${error.page}`}>
                          Type: {error.type} • Page: {error.page}
                        </EditableText>
                      </Text>
                    </Container>
                  ))}
                </Container>
              </Container>
            )}
          </Container>
        )}
      </Container>
    </Container>
  );
} 