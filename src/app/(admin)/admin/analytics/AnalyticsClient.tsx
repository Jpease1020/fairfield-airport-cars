'use client';

import React, { useState, useEffect } from 'react';
import { Container, H2, Text, Span } from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { Stack } from '@/design/ui';
import { Button } from '@/design/ui';
import { Box } from '@/design/ui';

interface AnalyticsData {
  totalInteractions: number;
  totalErrors: number;
  interactionTypes: Record<string, number>;
  errorTypes: Record<string, number>;
  elementTypes: Record<string, number>;
  recentErrors: any[];
  recentInteractions: any[];
}

export default function AnalyticsClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.analytics || {};
  
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
        <Text cmsId="loading-message">
          {cmsData?.['loading-message'] || '🔄 Loading analytics...'}
        </Text>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container>
        <Stack direction="vertical" spacing="md">
          <Text weight="bold" cmsId="no-data-title" >
            {cmsData?.['no-data-title'] || 'No Analytics Data'}
          </Text>
          <Text cmsId="no-data-message" >
            {cmsData?.['no-data-message'] || 'Analytics data will appear here once users start interacting with the app.'}
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="vertical" spacing="md">
        <Text weight="bold" cmsId="title" >
          {cmsData?.['title'] || 'Analytics Dashboard'}
        </Text>
        <Text cmsId="subtitle" >
          {cmsData?.['subtitle'] || 'User interactions, errors, and performance metrics'}
        </Text>
        <Button onClick={fetchAnalytics} variant="outline" size="sm" cmsId="refresh-button" >
          <Span cmsId="refresh-icon" cmsData={cmsData}>{cmsData?.['refresh-icon'] || '🔄'}</Span>
          <Text cmsId="refresh-button" >
            {cmsData?.['refresh-button'] || 'Refresh'}
          </Text>
        </Button>
      </Stack>
      
      {lastUpdated && (
        <Container>
          <Text cmsId="last-updated" >
            {cmsData?.['last-updated'] || `Last updated: ${lastUpdated.toLocaleString()}`}
          </Text>
        </Container>
      )}

      {/* Overview Section */}
      <Container>
        <Stack direction="vertical" spacing="lg">
          <H2 cmsId="overview-title" >
            {cmsData?.['overview-title'] || 'Overview'}
          </H2>
          
          <Stack direction="horizontal" spacing="lg">
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Text weight="bold" cmsId="overview-total-interactions-title" >
                  {cmsData?.['overview-total-interactions-title'] || '📊 Total Interactions'}
                </Text>
                <Text size="xl">{analytics.totalInteractions}</Text>
                <Text cmsId="overview-total-interactions-description" >
                  {cmsData?.['overview-total-interactions-description'] || 'All user interactions tracked'}
                </Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Text weight="bold" cmsId="overview-total-errors-title" >
                  {cmsData?.['overview-total-errors-title'] || '⚠️ Total Errors'}
                </Text>
                <Text size="xl">{analytics.totalErrors}</Text>
                <Text cmsId="overview-total-errors-description" >
                  {cmsData?.['overview-total-errors-description'] || 'Errors detected and tracked'}
                </Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Text weight="bold" cmsId="overview-error-rate-title" >
                  {cmsData?.['overview-error-rate-title'] || '📉 Error Rate'}
                </Text>
                <Text size="xl">
                  {analytics.totalInteractions > 0 
                    ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(1) 
                    : 0}%
                </Text>
                <Text cmsId="overview-error-rate-description" >
                  {cmsData?.['overview-error-rate-description'] || 'Percentage of interactions with errors'}
                </Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="sm">
                <Text weight="bold" cmsId="overview-active-elements-title" >
                  {cmsData?.['overview-active-elements-title'] || '🖱️ Active Elements'}
                </Text>
                <Text size="xl">{Object.keys(analytics.elementTypes).length}</Text>
                <Text cmsId="overview-active-elements-description" >
                  {cmsData?.['overview-active-elements-description'] || 'Different element types tracked'}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {/* Detailed Analytics */}
      <Container>
        <Stack direction="vertical" spacing="lg">
          <H2 cmsId="detailed-title" >
            {cmsData?.['detailed-title'] || 'Detailed Analytics'}
          </H2>
          
          <Stack direction="horizontal" spacing="lg">
            {/* Top Interaction Types */}
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="md">
                <Text weight="bold" cmsId="detailed-top-interaction-types-title" >
                  {cmsData?.['detailed-top-interaction-types-title'] || 'Top Interaction Types'}
                </Text>
                {getTopInteractions().map(([type, count]) => (
                  <Text key={type} >
                    {type}: {count}
                  </Text>
                ))}
              </Stack>
            </Box>
            
            {/* Top Error Types */}
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="md">
                <Text weight="bold" cmsId="detailed-top-error-types-title" >
                  {cmsData?.['detailed-top-error-types-title'] || 'Top Error Types'}
                </Text>
                {getTopErrors().map(([type, count]) => (
                  <Text key={type} >
                    {type}: {count}
                  </Text>
                ))}
              </Stack>
            </Box>
            
            {/* Top Element Types */}
            <Box variant="elevated" padding="md">
              <Stack direction="vertical" spacing="md">
                <Text weight="bold" cmsId="detailed-top-element-types-title" >
                  {cmsData?.['detailed-top-element-types-title'] || 'Most Interacted Elements'}
                </Text>
                {getTopElements().map(([type, count]) => (
                  <Text key={type} >
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
          <H2 cmsId="detailed-recent-activity-title" >
            {cmsData?.['detailed-recent-activity-title'] || 'Recent Activity'}
          </H2>
          
          <Stack direction="vertical" spacing="md">
            {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
              <Box key={index} variant="elevated" padding="sm">
                <Text >
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
          <H2 cmsId="detailed-recent-errors-title" >
            {cmsData?.['detailed-recent-errors-title'] || 'Recent Errors'}
          </H2>
          
          <Stack direction="vertical" spacing="md">
            {analytics.recentErrors.slice(0, 5).map((error, index) => (
              <Box key={index} variant="elevated" padding="sm">
                <Text >
                  {cmsData?.['detailed-recent-errors-details'] || `Type: ${error.type} • Page: ${error.page}`}
                </Text>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Container>
  );
}

