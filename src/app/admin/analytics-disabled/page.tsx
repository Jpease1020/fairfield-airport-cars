'use client';

import { useState, useEffect } from 'react';
import { 
  Container,
  H1,
  H2,
  H3,
  Text,
  Span,
  Button
} from '@/components/ui';

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
      <Container className="admin-dashboard">
        <Container className="loading-spinner">
          <Container className="loading-spinner-icon">🔄</Container>
          <Text>Loading analytics...</Text>
        </Container>
      </Container>
    );
  }

  return (
    <Container className="admin-dashboard">
      <Container className="section-header">
        <H1 className="page-title">Analytics Dashboard</H1>
        <Text className="page-subtitle">User interactions, errors, and performance metrics</Text>
        <Container className="header-actions">
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <Span className="btn-icon">🔄</Span>
            Refresh
          </Button>
        </Container>
      </Container>
      
      {lastUpdated && (
        <Container className="analytics-updated">
          <Text>Last updated: {lastUpdated.toLocaleString()}</Text>
        </Container>
      )}

      <Container className="standard-content">
        {!analytics ? (
          <Container className="card">
            <Container className="card-body">
              <Container className="empty-state">
                <Container className="empty-state-icon">⚠️</Container>
                <H3>No Analytics Data</H3>
                <Text>Analytics data will appear here once users start interacting with the app.</Text>
              </Container>
            </Container>
          </Container>
        ) : (
          <Container className="analytics-dashboard">
            {/* Overview Cards */}
            <Container className="analytics-overview-grid">
              <Container className="card analytics-card">
                <Container className="card-header analytics-card-header">
                  <H3 className="analytics-card-title">Total Interactions</H3>
                  <Span className="analytics-card-icon">📊</Span>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-stat-number">{analytics.totalInteractions.toLocaleString()}</Container>
                  <Text className="analytics-stat-description">
                    All user interactions tracked
                  </Text>
                </Container>
              </Container>

              <Container className="card analytics-card">
                <Container className="card-header analytics-card-header">
                  <H3 className="analytics-card-title">Total Errors</H3>
                  <Span className="analytics-card-icon error">⚠️</Span>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-stat-number error">
                    {analytics.totalErrors.toLocaleString()}
                  </Container>
                  <Text className="analytics-stat-description">
                    Errors detected and tracked
                  </Text>
                </Container>
              </Container>

              <Container className="card analytics-card">
                <Container className="card-header analytics-card-header">
                  <H3 className="analytics-card-title">Error Rate</H3>
                  <Span className="analytics-card-icon">📉</Span>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-stat-number">
                    {analytics.totalInteractions > 0 
                      ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(2)
                      : '0'
                    }%
                  </Container>
                  <Text className="analytics-stat-description">
                    Percentage of interactions with errors
                  </Text>
                </Container>
              </Container>

              <Container className="card analytics-card">
                <Container className="card-header analytics-card-header">
                  <H3 className="analytics-card-title">Active Elements</H3>
                  <Span className="analytics-card-icon">🖱️</Span>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-stat-number">
                    {Object.keys(analytics.elementTypes).length}
                  </Container>
                  <Text className="analytics-stat-description">
                    Different element types tracked
                  </Text>
                </Container>
              </Container>
            </Container>

            {/* Detailed Metrics */}
            <Container className="analytics-detailed-metrics">
              {/* Top Interaction Types */}
              <Container className="card">
                <Container className="card-header">
                  <H2 className="card-title">
                    <Span className="card-icon">🖱️</Span>
                    Top Interaction Types
                  </H2>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-list">
                    {getTopInteractions().map(([type, count]) => (
                      <Container key={type} className="analytics-list-item">
                        <Container className="analytics-item-info">
                          <div className="analytics-item-indicator primary"></div>
                          <Span className="analytics-item-label">
                            {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Span>
                        </Container>
                        <Span className="analytics-item-value">
                          {count.toLocaleString()}
                        </Span>
                      </Container>
                    ))}
                  </Container>
                </Container>
              </Container>

              {/* Top Error Types */}
              <Container className="card">
                <Container className="card-header">
                  <H2 className="card-title">
                    <Span className="card-icon">⚠️</Span>
                    Top Error Types
                  </H2>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-list">
                    {getTopErrors().map(([type, count]) => (
                      <Container key={type} className="analytics-list-item">
                        <Container className="analytics-item-info">
                          <div className="analytics-item-indicator error"></div>
                          <Span className="analytics-item-label">
                            {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Span>
                        </Container>
                        <Span className="analytics-item-value">
                          {count.toLocaleString()}
                        </Span>
                      </Container>
                    ))}
                  </Container>
                </Container>
              </Container>

              {/* Top Element Types */}
              <Container className="card">
                <Container className="card-header">
                  <H2 className="card-title">
                    <Span className="card-icon">📝</Span>
                    Most Interacted Elements
                  </H2>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-list">
                    {getTopElements().map(([element, count]) => (
                      <Container key={element} className="analytics-list-item">
                        <Container className="analytics-item-info">
                          <div className="analytics-item-indicator secondary"></div>
                          <Span className="analytics-item-label">
                            {element}
                          </Span>
                        </Container>
                        <Span className="analytics-item-value">
                          {count.toLocaleString()}
                        </Span>
                      </Container>
                    ))}
                  </Container>
                </Container>
              </Container>

              {/* Recent Activity */}
              <Container className="card">
                <Container className="card-header">
                  <H2 className="card-title">
                    <Span className="card-icon">⏰</Span>
                    Recent Activity
                  </H2>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-list">
                    {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
                      <Container key={index} className="analytics-list-item">
                        <Container className="analytics-item-info">
                          <div className="analytics-item-indicator primary"></div>
                          <Span className="analytics-item-label">
                            {interaction.type} on {interaction.element}
                          </Span>
                        </Container>
                        <Span className="analytics-item-time">
                          {new Date(interaction.timestamp).toLocaleTimeString()}
                        </Span>
                      </Container>
                    ))}
                  </Container>
                </Container>
              </Container>
            </Container>

            {/* Recent Errors */}
            {analytics.recentErrors.length > 0 && (
              <Container className="card">
                <Container className="card-header">
                  <H2 className="card-title">
                    <Span className="card-icon">⚠️</Span>
                    Recent Errors
                  </H2>
                </Container>
                <Container className="card-body">
                  <Container className="analytics-errors">
                    {analytics.recentErrors.slice(0, 10).map((error, index) => (
                      <Container key={index} className="analytics-error-item">
                        <Container className="analytics-error-header">
                          <Span className="analytics-error-message">
                            {error.message}
                          </Span>
                          <Span className="analytics-error-time">
                            {new Date(error.timestamp).toLocaleString()}
                          </Span>
                        </Container>
                        <Text className="analytics-error-details">
                          Type: {error.type} • Page: {error.page}
                        </Text>
                      </Container>
                    ))}
                  </Container>
                </Container>
              </Container>
            )}
          </Container>
        )}
      </Container>
    </Container>
  );
} 