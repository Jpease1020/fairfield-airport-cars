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
} from '@/ui';
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
}

export function CostTrackingDashboard({
  onRefresh,
  onCostUpdate
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

      console.log('💰 Loading real-time cost data...');
      
      const [costsData, summaryData] = await Promise.all([
        realCostTrackingService.getCosts(),
        realCostTrackingService.getRealCostSummary()
      ]);

      setCosts(costsData);
      setSummary(summaryData);
      setLastUpdate(new Date());
      
      console.log('✅ Cost data loaded:', costsData.length, 'categories');
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
    if (cost.actualMonthlyCost === 0) return 'pending';
    if (cost.actualMonthlyCost > cost.projectedMonthlyCost * 1.1) return 'over-budget';
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
          <Text>Loading real-time cost data...</Text>
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
            <Text weight="bold" size="xl">Real-Time Cost Tracking</Text>
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Stack>
          {lastUpdate && (
            <Text variant="muted" size="sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </Stack>

        {/* Cost Summary Cards */}
        <GridSection variant="stats" columns={4}>
          <CostCard $status="on-track">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">Total Monthly Cost</Text>
              <Text size="xl" weight="bold">
                {summary ? formatCurrency(summary.totalActualMonthly) : '$0'}
              </Text>
              <Text variant="muted" size="sm">
                {summary && summary.totalProjectedMonthly > 0 
                  ? `${((summary.totalActualMonthly / summary.totalProjectedMonthly - 1) * 100).toFixed(1)}% vs projected`
                  : 'No projection'
                }
              </Text>
            </Stack>
          </CostCard>

          <CostCard $status="on-track">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">Projected Monthly</Text>
              <Text size="xl" weight="bold">
                {summary ? formatCurrency(summary.totalProjectedMonthly) : '$0'}
              </Text>
              <Text variant="muted" size="sm">{costs.length} cost categories</Text>
            </Stack>
          </CostCard>

          <CostCard $status="on-track">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">Annual Projection</Text>
              <Text size="xl" weight="bold">
                {summary ? formatCurrency(summary.totalYearly) : '$0'}
              </Text>
              <Text variant="muted" size="sm">Yearly estimate</Text>
            </Stack>
          </CostCard>

          <SavingsCard>
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">Potential Savings</Text>
                              <Text size="xl" weight="bold">
                {formatCurrency(getTotalSavings())}
              </Text>
              <Text variant="muted" size="sm">
                {getSavingsOpportunities().length} opportunities
              </Text>
            </Stack>
          </SavingsCard>
        </GridSection>

        {/* Cost Breakdown */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg">Cost Breakdown by Category</Text>
            
            <Stack spacing="md">
              {costs.map((cost) => {
                const status = getCostStatus(cost);
                const variance = getVariance(cost.actualMonthlyCost, cost.projectedMonthlyCost);
                
                return (
                  <CostCard key={cost.id} $status={status}>
                    <Stack spacing="sm">
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Stack spacing="xs">
                          <Text weight="bold">{cost.service}</Text>
                          <Text variant="muted" size="sm">{cost.category}</Text>
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
                          <Text variant="muted" size="sm">Projected</Text>
                          <Text weight="bold">
                            {formatCurrency(cost.projectedMonthlyCost)}
                          </Text>
                        </Stack>

                        <Stack spacing="xs">
                          <Text variant="muted" size="sm">Actual</Text>
                          <Text weight="bold">
                            {cost.actualMonthlyCost === 0 ? 'Pending' : formatCurrency(cost.actualMonthlyCost)}
                          </Text>
                        </Stack>

                        <Stack spacing="xs">
                          <Text variant="muted" size="sm">Variance</Text>
                          <VarianceIndicator $variance={variance}>
                            <Text weight="bold">
                              {cost.actualMonthlyCost === 0 ? 'N/A' : 
                               `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`}
                            </Text>
                            {cost.actualMonthlyCost > 0 && (
                              <Text size="sm">{getVarianceIcon(variance)}</Text>
                            )}
                          </VarianceIndicator>
                        </Stack>
                      </GridSection>

                      {/* Usage Metrics */}
                      {cost.usageMetrics && Object.keys(cost.usageMetrics).length > 0 && (
                        <Stack spacing="xs">
                          <Text variant="muted" size="sm">Usage Metrics</Text>
                          <Stack direction="horizontal" spacing="md">
                            {cost.usageMetrics.apiCalls && (
                              <Text size="sm">API Calls: {cost.usageMetrics.apiCalls}</Text>
                            )}
                            {cost.usageMetrics.bandwidth && (
                              <Text size="sm">Bandwidth: {cost.usageMetrics.bandwidth}</Text>
                            )}
                            {cost.usageMetrics.storage && (
                              <Text size="sm">Storage: {cost.usageMetrics.storage}</Text>
                            )}
                            {cost.usageMetrics.transactions && (
                              <Text size="sm">Transactions: {cost.usageMetrics.transactions}</Text>
                            )}
                          </Stack>
                        </Stack>
                      )}

                      {/* Data Source */}
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Text variant="muted" size="sm">Data Source</Text>
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
              <Text weight="bold" size="lg">💡 Cost Optimization Opportunities</Text>
              
              <Stack spacing="md">
                {getSavingsOpportunities().map((opportunity: string, index: number) => (
                  <Box key={index} variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Text weight="bold">💡 {opportunity}</Text>
                      <Text size="sm" variant="muted">
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
              <Text weight="bold" size="lg">📊 Cost Trend Analysis</Text>
              
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text>Cost Trend</Text>
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