'use client';

import React, { useState, useEffect } from 'react';
import { Container, H2, Text, Span } from '@/ui';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import { Stack } from '@/ui';
import { Button } from '@/ui';
import { Box } from '@/ui';

// Helper function to get field value from CMS
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const value = resolvePath(cmsData, fieldPath.split('.'));
  return typeof value === 'string' ? (value as string) : defaultValue;
}

interface AnalyticsData {
  totalInteractions: number;
  totalErrors: number;
  interactionTypes: Record<string, number>;
  errorTypes: Record<string, number>;
  elementTypes: Record<string, number>;
  recentErrors: any[];
  recentInteractions: any[];
}

interface AnalyticsClientProps {
  cmsData: any;
}

export default function AnalyticsClient({ cmsData }: AnalyticsClientProps) {
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
        <Text data-cms-id="loading-message" mode={mode}>
          {getCMSField(cmsData, 'loading-message', '🔄 Loading analytics...')}
        </Text>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container>
        <Stack direction="vertical" spacing="md">
          <Text weight="bold" data-cms-id="no-data-title" mode={mode}>
            {getCMSField(cmsData, 'no-data-title', 'No Analytics Data')}
          </Text>
          <Text data-cms-id="no-data-message" mode={mode}>
            {getCMSField(cmsData, 'no-data-message', 'Analytics data will appear here once users start interacting with the app.')}
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="vertical" spacing="md">
        <Text weight="bold" data-cms-id="title" mode={mode}>
          {getCMSField(cmsData, 'title', 'Analytics Dashboard')}
        </Text>
        <Text data-cms-id="subtitle" mode={mode}>
          {getCMSField(cmsData, 'subtitle', 'User interactions, errors, and performance metrics')}
        </Text>
        <Button onClick={fetchAnalytics} variant="outline" size="sm" data-cms-id="refresh-button" interactionMode={mode}>
          <Span>🔄</Span>
          {getCMSField(cmsData, 'refresh-button', 'Refresh')}
        </Button>
      </Stack>
      
      {lastUpdated && (
        <Container>
          <Text data-cms-id="last-updated" mode={mode}>
            {getCMSField(cmsData, 'last-updated', `Last updated: ${lastUpdated.toLocaleString()}`)}
          </Text>
        </Container>
      )}

      {/* Overview Section */}
      <Container>
        <Stack direction="vertical" spacing="lg">
          <H2 data-cms-id="overview-title" mode={mode}>
            {getCMSField(cmsData, 'overview-title', 'Overview')}
          </H2>
          
          <Stack direction="horizontal" spacing="lg">
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Text weight="bold" data-cms-id="overview-total-interactions-title" mode={mode}>
                  {getCMSField(cmsData, 'overview-total-interactions-title', '📊 Total Interactions')}
                </Text>
                <Text size="xl">{analytics.totalInteractions}</Text>
                <Text data-cms-id="overview-total-interactions-description" mode={mode}>
                  {getCMSField(cmsData, 'overview-total-interactions-description', 'All user interactions tracked')}
                </Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Text weight="bold" data-cms-id="overview-total-errors-title" mode={mode}>
                  {getCMSField(cmsData, 'overview-total-errors-title', '⚠️ Total Errors')}
                </Text>
                <Text size="xl">{analytics.totalErrors}</Text>
                <Text data-cms-id="overview-total-errors-description" mode={mode}>
                  {getCMSField(cmsData, 'overview-total-errors-description', 'Errors detected and tracked')}
                </Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Text weight="bold" data-cms-id="overview-error-rate-title" mode={mode}>
                  {getCMSField(cmsData, 'overview-error-rate-title', '📉 Error Rate')}
                </Text>
                <Text size="xl">
                  {analytics.totalInteractions > 0 
                    ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(1) 
                    : 0}%
                </Text>
                <Text data-cms-id="overview-error-rate-description" mode={mode}>
                  {getCMSField(cmsData, 'overview-error-rate-description', 'Percentage of interactions with errors')}
                </Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Text weight="bold" data-cms-id="overview-active-elements-title" mode={mode}>
                  {getCMSField(cmsData, 'overview-active-elements-title', '🖱️ Active Elements')}
                </Text>
                <Text size="xl">{Object.keys(analytics.elementTypes).length}</Text>
                <Text data-cms-id="overview-active-elements-description" mode={mode}>
                  {getCMSField(cmsData, 'overview-active-elements-description', 'Different element types tracked')}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {/* Detailed Analytics */}
      <Container>
        <Stack direction="vertical" spacing="lg">
          <H2 data-cms-id="detailed-title" mode={mode}>
            {getCMSField(cmsData, 'detailed-title', 'Detailed Analytics')}
          </H2>
          
          <Stack direction="horizontal" spacing="lg">
            {/* Top Interaction Types */}
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="md">
                <Text weight="bold" data-cms-id="detailed-top-interaction-types-title" mode={mode}>
                  {getCMSField(cmsData, 'detailed-top-interaction-types-title', 'Top Interaction Types')}
                </Text>
                {getTopInteractions().map(([type, count]) => (
                  <Text key={type} mode={mode}>
                    {type}: {count}
                  </Text>
                ))}
              </Stack>
            </Box>
            
            {/* Top Error Types */}
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="md">
                <Text weight="bold" data-cms-id="detailed-top-error-types-title" mode={mode}>
                  {getCMSField(cmsData, 'detailed-top-error-types-title', 'Top Error Types')}
                </Text>
                {getTopErrors().map(([type, count]) => (
                  <Text key={type} mode={mode}>
                    {type}: {count}
                  </Text>
                ))}
              </Stack>
            </Box>
            
            {/* Top Element Types */}
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="md">
                <Text weight="bold" data-cms-id="detailed-top-element-types-title" mode={mode}>
                  {getCMSField(cmsData, 'detailed-top-element-types-title', 'Most Interacted Elements')}
                </Text>
                {getTopElements().map(([type, count]) => (
                  <Text key={type} mode={mode}>
                    {type}: {count}
                  </Text>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {/* Recent Activity */}
      <Container>
        <Stack direction="vertical" spacing="lg">
          <H2 data-cms-id="detailed-recent-activity-title" mode={mode}>
            {getCMSField(cmsData, 'detailed-recent-activity-title', 'Recent Activity')}
          </H2>
          
          <Stack direction="vertical" spacing="md">
            {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
              <Box key={index} variant="elevated" padding="sm">
                <Text mode={mode}>
                  {interaction.type}: {interaction.element} at {new Date(interaction.timestamp).toLocaleString()}
                </Text>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>

      {/* Recent Errors */}
      <Container>
        <Stack direction="vertical" spacing="lg">
          <H2 data-cms-id="detailed-recent-errors-title" mode={mode}>
            {getCMSField(cmsData, 'detailed-recent-errors-title', 'Recent Errors')}
          </H2>
          
          <Stack direction="vertical" spacing="md">
            {analytics.recentErrors.slice(0, 5).map((error, index) => (
              <Box key={index} variant="elevated" padding="sm">
                <Text mode={mode}>
                  {getCMSField(cmsData, 'detailed-recent-errors-details', `Type: ${error.type} • Page: ${error.page}`)}
                </Text>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Container>
  );
}

