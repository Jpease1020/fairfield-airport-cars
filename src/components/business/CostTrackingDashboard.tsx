'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container,
  Stack,
  Text,
  Box,
  Badge,
  LoadingSpinner,
  Alert,
  GridSection,
  Button
} from '@/design/ui';
import { colors } from '@/design/foundation/tokens/tokens';
import styled from 'styled-components';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';

// Styled components for cost tracking
const CostCard = styled.div<{ $status: 'on-track' | 'over-budget' | 'pending' }>`
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'on-track': return colors.success[200];
      case 'over-budget': return colors.danger[200];
      case 'pending': return colors.warning[200];
      default: return colors.gray[200];
    }
  }};
  background: ${props => {
    switch (props.$status) {
      case 'on-track': return colors.success[50];
      case 'over-budget': return colors.danger[50];
      case 'pending': return colors.warning[50];
      default: return colors.gray[50];
    }
  }};
`;

const SavingsCard = styled.div`
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid ${colors.success[200]};
  background: ${colors.success[50]};
`;

const VarianceIndicator = styled.div<{ $variance: number }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => {
    if (props.$variance > 10) return colors.danger[600];
    if (props.$variance > 0) return colors.warning[600];
    return colors.success[600];
  }};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $width: number; $isOverBudget: boolean }>`
  width: ${props => props.$width}%;
  height: 100%;
  background-color: ${props => props.$isOverBudget ? colors.danger[500] : colors.success[500]};
  transition: width 0.3s ease;
`;

interface CostTrackingDashboardProps {
  onRefresh?: () => void;
  onCostUpdate?: (costId: string, updates: Partial<RealCostItem>) => void;
  cmsData: any;
}

export function CostTrackingDashboard({
  onRefresh,
  onCostUpdate,
  cmsData
}: CostTrackingDashboardProps) {
  const [costs, setCosts] = useState<RealCostItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load cost data
  useEffect(() => {
    loadCostData();
  }, []);

  const loadCostData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [costsData, summaryData] = await Promise.all([
        realCostTrackingService.getCosts(),
        realCostTrackingService.getRealCostSummary()
      ]);

      setCosts(costsData);
      setSummary(summaryData);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('❌ Error loading cost data:', err);
      setError('Failed to load cost data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadCostData();
    setRefreshing(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCostStatus = (cost: RealCostItem): 'on-track' | 'over-budget' | 'pending' => {
    if ((cost.actualMonthlyCost ?? 0) === 0) return 'pending';
    if ((cost.actualMonthlyCost ?? 0) > (cost.projectedMonthlyCost ?? 0) * 1.1) return 'over-budget';
    return 'on-track';
  };

  const getVariance = (actual: number, projected: number) => {
    if (projected === 0) return 0;
    return ((actual - projected) / projected) * 100;
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 10) return '📈';
    if (variance > 0) return '📊';
    return '📉';
  };

  const getSavingsOpportunities = () => {
    if (!summary?.savingsOpportunities) return [];
    return summary.savingsOpportunities.slice(0, 3); // Top 3 opportunities
  };

  const getTotalSavings = () => {
    if (!summary?.savingsOpportunities) return 0;
    // Estimate savings based on opportunities
    return summary.savingsOpportunities.length * 50; // $50 per opportunity
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text cmsId="cost-tracking-loading">{cmsData?.['costTrackingLoading'] || 'Loading real-time cost data...'}</Text>
        </Stack>
      </Container>
    );  
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Stack spacing="xs">
              <Text weight="bold" size="xl" cmsId="cost-tracking-title">{cmsData?.['costTrackingTitle'] || 'Real-Time Cost Tracking'}</Text>
              <Text variant="muted" size="sm" cmsId="ignore">
                {costs.length} cost categories • {costs.filter(c => c.dataSource === 'api').length} from APIs
              </Text>
            </Stack>
            
            <Stack direction="horizontal" spacing="md" align="center">
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                  cmsId="cost-tracking-refresh-button"
                  text={refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
                />
              )}
              
              <Button
                onClick={loadCostData}
                variant="outline"
                size="sm"
                disabled={refreshing}
                cmsId="cost-tracking-reload-button"
                text="📊 Reload Data"
              />
            </Stack>
          </Stack>
          
          {lastUpdate && (
            <Text variant="muted" size="sm" cmsId="cost-tracking-dashboard-last-updated">
              {cmsData?.['costTrackingDashboardLastUpdated'] || `Last updated: ${lastUpdate.toLocaleTimeString()}`}
            </Text>
          )}
        </Stack>

        {/* Cost Summary Cards */}
        <GridSection variant="stats" columns={4}>
          <CostCard $status="on-track">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold" cmsId="cost-tracking-dashboard-total-monthly-cost">{cmsData?.['costTrackingDashboardTotalMonthlyCost'] || 'Total Monthly Cost'}</Text>
              <Text size="xl" weight="bold" cmsId="ignore">
                {summary ? formatCurrency(summary.totalActualMonthly) : '$0'}
              </Text>
              <Text variant="muted" size="sm" cmsId="ignore">
                {summary && summary.totalProjectedMonthly > 0 
                  ? `${((summary.totalActualMonthly / summary.totalProjectedMonthly - 1) * 100).toFixed(1)}% vs projected`
                  : 'No projection'
                }
              </Text>
            </Stack>
          </CostCard>

          <CostCard $status="on-track">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold" cmsId="cost-tracking-dashboard-projected-monthly">{cmsData?.['costTrackingDashboardProjectedMonthly'] || 'Projected Monthly'}</Text>
              <Text size="xl" weight="bold">
                {summary ? formatCurrency(summary.totalProjectedMonthly) : '$0'}
              </Text>
              <Text variant="muted" size="sm" cmsId="ignore">{costs.length} cost categories</Text>
            </Stack>
          </CostCard>

          <CostCard $status="on-track">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold" cmsId="cost-tracking-dashboard-annual-projection">{cmsData?.['costTrackingDashboardAnnualProjection'] || 'Annual Projection'}</Text>
              <Text size="xl" weight="bold">
                {summary ? formatCurrency(summary.totalYearly) : '$0'}
              </Text>
              <Text variant="muted" size="sm" cmsId="cost-tracking-dashboard-yearly-estimate">{cmsData?.['costTrackingDashboardYearlyEstimate'] || 'Yearly estimate'}</Text>
            </Stack>
          </CostCard>

          <SavingsCard>
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold" cmsId="cost-tracking-dashboard-potential-savings">{cmsData?.['costTrackingDashboardPotentialSavings'] || 'Potential Savings'}</Text>
              <Text size="xl" weight="bold" cmsId="ignore">
                {formatCurrency(getTotalSavings())}
              </Text>
              <Text variant="muted" size="sm" cmsId="ignore">
                {getSavingsOpportunities().length} opportunities
              </Text>
            </Stack>
          </SavingsCard>
        </GridSection>

        {/* Cost Breakdown */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg" cmsId="cost-tracking-dashboard-cost-breakdown-by-category">{cmsData?.['costTrackingDashboardCostBreakdownByCategory'] || 'Cost Breakdown by Category'}</Text>
            
            <Stack spacing="md">
              {costs.map((cost) => {
                const status = getCostStatus(cost);
                const variance = getVariance(cost.actualMonthlyCost ?? 0, cost.projectedMonthlyCost ?? 0);
                
                return (
                  <CostCard key={cost.id} $status={status}>
                    <Stack spacing="sm">
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Stack spacing="xs">
                          <Text weight="bold" cmsId="ignore">{cost.service}</Text>
                          <Text variant="muted" size="sm" cmsId="ignore">{cost.category}</Text>
                        </Stack>
                        <Badge 
                          variant={
                            status === 'over-budget' ? 'error' :
                            status === 'pending' ? 'warning' : 'success'
                          }
                        >
                          {status === 'pending' ? 'Pending' :
                           status === 'over-budget' ? 'Over Budget' : 'On Track'}
                        </Badge>
                      </Stack>

                      <GridSection variant="content" columns={3}>
                        <Stack spacing="xs">
                          <Text variant="muted" size="sm" cmsId="cost-tracking-dashboard-projected">{cmsData?.['costTrackingDashboardProjected'] || 'Projected'} </Text>
                          <Text weight="bold" cmsId="ignore">
                            {formatCurrency(cost.projectedMonthlyCost ?? 0)}
                          </Text>
                        </Stack>

                        <Stack spacing="xs">
                          <Text variant="muted" size="sm" cmsId="cost-tracking-dashboard-actual">{cmsData?.['costTrackingDashboardActual'] || 'Actual'} </Text>
                          <Text weight="bold">
                            {(cost.actualMonthlyCost ?? 0) === 0 ? 'Pending' : formatCurrency(cost.actualMonthlyCost ?? 0)}
                          </Text>
                        </Stack>

                        <Stack spacing="xs">
                          <Text variant="muted" size="sm" cmsId="cost-tracking-dashboard-variance">{cmsData?.['costTrackingDashboardVariance'] || 'Variance'}</Text>
                          <VarianceIndicator $variance={variance}>
                            <Text weight="bold">
                              {(cost.actualMonthlyCost ?? 0) === 0 ? 'N/A' : 
                               `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`}
                            </Text>
                            {(cost.actualMonthlyCost ?? 0) > 0 && (
                              <Text size="sm" cmsId="ignore">{getVarianceIcon(variance)}</Text>
                            )}
                          </VarianceIndicator>
                        </Stack>
                      </GridSection>

                      {/* Usage Metrics */}
                      {cost.usageMetrics && Object.keys(cost.usageMetrics).length > 0 && (
                        <Stack spacing="xs">
                          <Text variant="muted" size="sm" cmsId="cost-tracking-dashboard-usage-metrics">{cmsData?.['costTrackingDashboardUsageMetrics'] || 'Usage Metrics'}</Text>
                          <Stack direction="horizontal" spacing="md">
                            {cost.usageMetrics.apiCalls && (
                              <Text size="sm" cmsId="ignore">API Calls: {cost.usageMetrics.apiCalls}</Text>
                            )}
                            {cost.usageMetrics.bandwidth && (
                              <Text size="sm" cmsId="ignore">Bandwidth: {cost.usageMetrics.bandwidth}</Text>
                            )}
                            {cost.usageMetrics.storage && (
                              <Text size="sm" cmsId="ignore">Storage: {cost.usageMetrics.storage}</Text>
                            )}
                            {cost.usageMetrics.transactions && (
                              <Text size="sm" cmsId="ignore">Transactions: {cost.usageMetrics.transactions}</Text>
                            )}
                          </Stack>
                        </Stack>
                      )}

                      {/* Data Source */}
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Text variant="muted" size="sm" cmsId="cost-tracking-dashboard-data-source">{cmsData?.['costTrackingDashboardDataSource'] || 'Data Source'}</Text>
                        <Badge variant="default" size="sm">
                          {cost.dataSource === 'api' ? 'API' :
                           cost.dataSource === 'manual' ? 'Manual' : 'Estimated'}
                        </Badge>
                      </Stack>
                    </Stack>
                  </CostCard>
                );
              })}
            </Stack>
          </Stack>
        </Box>

        {/* Savings Opportunities */}
        {getSavingsOpportunities().length > 0 && (
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text weight="bold" size="lg" cmsId="cost-tracking-dashboard-optimization-opportunities">{cmsData?.['costTrackingDashboardOptimizationOpportunities'] || '💡 Cost Optimization Opportunities'}</Text>
              
              <Stack spacing="md">
                {getSavingsOpportunities().map((opportunity: string, index: number) => (
                  <Box key={index} variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Text weight="bold" cmsId="ignore">💡 {opportunity}</Text>
                                              <Text size="sm" variant="muted" cmsId="ignore">
                          Estimated savings: ~$50/month
                        </Text>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Cost Trend */}
        {summary?.costTrend && (
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text weight="bold" size="lg" cmsId="cost-tracking-dashboard-cost-trend-analysis">{cmsData?.['costTrackingDashboardCostTrendAnalysis'] || '📊 Cost Trend Analysis'}</Text>
              
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text cmsId="cost-tracking-dashboard-cost-trend">{cmsData?.['costTrackingDashboardCostTrend'] || 'Cost Trend'}</Text>
                  <Badge 
                    variant={
                      summary.costTrend === 'increasing' ? 'error' :
                      summary.costTrend === 'decreasing' ? 'success' : 'warning'
                    }
                  >
                    {summary.costTrend === 'increasing' ? '📈 Increasing' :
                     summary.costTrend === 'decreasing' ? '📉 Decreasing' : '➡️ Stable'}
                  </Badge>
                </Stack>

                <ProgressBarContainer>
                  <ProgressBarFill
                    $width={Math.min(100, (summary.totalActualMonthly / (summary.totalProjectedMonthly || 1)) * 100)}
                    $isOverBudget={summary.totalActualMonthly > summary.totalProjectedMonthly}
                  />
                </ProgressBarContainer>
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
} 