'use client';

import React, { useState, useEffect } from 'react';
import { Container, H2, Text, Span } from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import { Stack } from '@/ui';
import { Button } from '@/ui';
import { Box } from '@/ui';

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
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  
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
        <Text data-cms-id="admin.analytics.loading.message" mode={mode}>
          {getCMSField(cmsData, 'admin.analytics.loading.message', '🔄 Loading analytics...')}
        </Text>
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="vertical" spacing="md">
        <Text weight="bold" data-cms-id="admin.analytics.title" mode={mode}>
          {getCMSField(cmsData, 'admin.analytics.title', 'Analytics Dashboard')}
        </Text>
        <Text data-cms-id="admin.analytics.userInteractions.description" mode={mode}>
          {getCMSField(cmsData, 'admin.analytics.userInteractions.description', 'User interactions, errors, and performance metrics')}
        </Text>
        <Button onClick={fetchAnalytics} variant="outline" size="sm" data-cms-id="admin.analytics.refreshButton" interactionMode={mode}>
          <Span>🔄</Span>
          {getCMSField(cmsData, 'admin.analytics.refreshButton', 'Refresh')}
        </Button>
      </Stack>
      
      {lastUpdated && (
        <Container>
          <Text data-cms-id="admin.analytics.lastUpdated" mode={mode}>
            {getCMSField(cmsData, 'admin.analytics.lastUpdated', `Last updated: ${lastUpdated.toLocaleString()}`)}
          </Text>
        </Container>
      )}

      <Container>
        {!analytics ? (
          <Stack direction="vertical" spacing="md" align="center">
            <Span>⚠️</Span>
            <Text weight="bold" data-cms-id="admin.analytics.noData.title" mode={mode}>
              {getCMSField(cmsData, 'admin.analytics.noData.title', 'No Analytics Data')}
            </Text>
            <Text data-cms-id="admin.analytics.noData.message" mode={mode}>
              {getCMSField(cmsData, 'admin.analytics.noData.message', 'Analytics data will appear here once users start interacting with the app.')}
            </Text>
          </Stack>
        ) : (
          <Container>
            {/* Overview Cards */}
            <Stack direction="horizontal" spacing="md">
              <Box variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Text size="lg" weight="bold" data-cms-id="admin.analytics.sections.overview.totalInteractions.title" mode={mode}>
                    {getCMSField(cmsData, 'admin.analytics.sections.overview.totalInteractions.title', '📊 Total Interactions')}
                  </Text>
                  <Text size="xl" weight="bold">{analytics.totalInteractions.toLocaleString()}</Text>
                  <Text data-cms-id="admin.analytics.sections.overview.totalInteractions.description" mode={mode}>
                    {getCMSField(cmsData, 'admin.analytics.sections.overview.totalInteractions.description', 'All user interactions tracked')}
                  </Text>
                </Stack>
              </Box>

              <Box variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Text size="lg" weight="bold" data-cms-id="admin.analytics.sections.overview.totalErrors.title" mode={mode}>
                    {getCMSField(cmsData, 'admin.analytics.sections.overview.totalErrors.title', '⚠️ Total Errors')}
                  </Text>
                  <Text size="xl" weight="bold">{analytics.totalErrors.toLocaleString()}</Text>
                  <Text data-cms-id="admin.analytics.sections.overview.totalErrors.description" mode={mode}>
                    {getCMSField(cmsData, 'admin.analytics.sections.overview.totalErrors.description', 'Errors detected and tracked')}
                  </Text>
                </Stack>
              </Box>

              <Box variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Text size="lg" weight="bold" data-cms-id="admin.analytics.sections.overview.errorRate.title" mode={mode}>
                    {getCMSField(cmsData, 'admin.analytics.sections.overview.errorRate.title', '📉 Error Rate')}
                  </Text>
                  <Text size="xl" weight="bold">{`${analytics.totalInteractions > 0 
                    ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(2)
                    : '0'
                  }%`}</Text>
                  <Text data-cms-id="admin.analytics.sections.overview.errorRate.description" mode={mode}>
                    {getCMSField(cmsData, 'admin.analytics.sections.overview.errorRate.description', 'Percentage of interactions with errors')}
                  </Text>
                </Stack>
              </Box>

              <Box variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Text size="lg" weight="bold" data-cms-id="admin.analytics.sections.overview.activeElements.title" mode={mode}>
                    {getCMSField(cmsData, 'admin.analytics.sections.overview.activeElements.title', '🖱️ Active Elements')}
                  </Text>
                  <Text size="xl" weight="bold">{Object.keys(analytics.elementTypes).length.toString()}</Text>
                  <Text data-cms-id="admin.analytics.sections.overview.activeElements.description" mode={mode}>
                    {getCMSField(cmsData, 'admin.analytics.sections.overview.activeElements.description', 'Different element types tracked')}
                  </Text>
                </Stack>
              </Box>
            </Stack>

            {/* Detailed Metrics */}
            <Container>
              {/* Top Interaction Types */}
              <Container>
                <H2 data-cms-id="admin.analytics.sections.detailed.topInteractionTypes.title" mode={mode}>
                  <Span>🖱️</Span>
                  {getCMSField(cmsData, 'admin.analytics.sections.detailed.topInteractionTypes.title', 'Top Interaction Types')}
                </H2>
                <Container>
                  {getTopInteractions().map(([type, count]) => (
                    <Container key={type}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span data-cms-id="admin.analytics.sections.detailed.topInteractionTypes.item" mode={mode}>
                          ● {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </Span>
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
                <H2 data-cms-id="admin.analytics.sections.detailed.topErrorTypes.title" mode={mode}>
                  <Span>⚠️</Span>
                  {getCMSField(cmsData, 'admin.analytics.sections.detailed.topErrorTypes.title', 'Top Error Types')}
                </H2>
                <Container>
                  {getTopErrors().map(([type, count]) => (
                    <Container key={type}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span data-cms-id="admin.analytics.sections.detailed.topErrorTypes.item" mode={mode}>
                          ● {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </Span>
                        <Span>{count.toLocaleString()}</Span>
                      </Stack>
                    </Container>
                  ))}
                </Container>
              </Container>

              {/* Top Element Types */}
              <Container>
                <H2 data-cms-id="admin.analytics.sections.detailed.topElementTypes.title" mode={mode}>
                  <Span>📝</Span>
                  {getCMSField(cmsData, 'admin.analytics.sections.detailed.topElementTypes.title', 'Most Interacted Elements')}
                </H2>
                <Container>
                  {getTopElements().map(([element, count]) => (
                    <Container key={element}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span data-cms-id="admin.analytics.sections.detailed.topElementTypes.item" mode={mode}>
                          ● {element}
                        </Span>
                        <Span>{count.toLocaleString()}</Span>
                      </Stack>
                    </Container>
                  ))}
                </Container>
              </Container>

              {/* Recent Activity */}
              <Container>
                <H2 data-cms-id="admin.analytics.sections.detailed.recentActivity.title" mode={mode}>
                  <Span>⏰</Span>
                  {getCMSField(cmsData, 'admin.analytics.sections.detailed.recentActivity.title', 'Recent Activity')}
                </H2>
                <Container>
                  {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
                    <Container key={index}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span data-cms-id="admin.analytics.sections.detailed.recentActivity.item" mode={mode}>
                          ● {interaction.type} on {interaction.element}
                        </Span>
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
                <H2 data-cms-id="admin.analytics.sections.detailed.recentErrors.title" mode={mode}>
                  <Span>⚠️</Span>
                  {getCMSField(cmsData, 'admin.analytics.sections.detailed.recentErrors.title', 'Recent Errors')}
                </H2>
                <Container>
                  {analytics.recentErrors.slice(0, 10).map((error, index) => (
                    <Container key={index}>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Span data-cms-id="admin.analytics.sections.detailed.recentErrors.item" mode={mode}>
                          {error.message}
                        </Span>
                        <Span>{new Date(error.timestamp).toLocaleString()}</Span>
                      </Stack>
                      <Text data-cms-id="admin.analytics.sections.detailed.recentErrors.details" mode={mode}>
                        {getCMSField(cmsData, 'admin.analytics.sections.detailed.recentErrors.details', `Type: ${error.type} • Page: ${error.page}`)}
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