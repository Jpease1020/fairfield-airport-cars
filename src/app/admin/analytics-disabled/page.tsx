'use client';

import { useState, useEffect } from 'react';

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
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">User interactions, errors, and performance metrics</p>
        <div className="header-actions">
          <button onClick={fetchAnalytics} className="btn btn-outline btn-sm">
            <span className="btn-icon">🔄</span>
            Refresh
          </button>
        </div>
      </div>
      
      {lastUpdated && (
        <div className="analytics-updated">
          <p>Last updated: {lastUpdated.toLocaleString()}</p>
        </div>
      )}

      <div className="standard-content">
        {!analytics ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">⚠️</div>
                <h3>No Analytics Data</h3>
                <p>Analytics data will appear here once users start interacting with the app.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="analytics-dashboard">
            {/* Overview Cards */}
            <div className="grid grid-4 gap-lg">
              <div className="card analytics-card">
                <div className="card-header analytics-card-header">
                  <h3 className="analytics-card-title">Total Interactions</h3>
                  <span className="analytics-card-icon">📊</span>
                </div>
                <div className="card-body">
                  <div className="analytics-stat-number">{analytics.totalInteractions.toLocaleString()}</div>
                  <p className="analytics-stat-description">
                    All user interactions tracked
                  </p>
                </div>
              </div>

              <div className="card analytics-card">
                <div className="card-header analytics-card-header">
                  <h3 className="analytics-card-title">Total Errors</h3>
                  <span className="analytics-card-icon error">⚠️</span>
                </div>
                <div className="card-body">
                  <div className="analytics-stat-number error">
                    {analytics.totalErrors.toLocaleString()}
                  </div>
                  <p className="analytics-stat-description">
                    Errors detected and tracked
                  </p>
                </div>
              </div>

              <div className="card analytics-card">
                <div className="card-header analytics-card-header">
                  <h3 className="analytics-card-title">Error Rate</h3>
                  <span className="analytics-card-icon">📉</span>
                </div>
                <div className="card-body">
                  <div className="analytics-stat-number">
                    {analytics.totalInteractions > 0 
                      ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(2)
                      : '0'
                    }%
                  </div>
                  <p className="analytics-stat-description">
                    Percentage of interactions with errors
                  </p>
                </div>
              </div>

              <div className="card analytics-card">
                <div className="card-header analytics-card-header">
                  <h3 className="analytics-card-title">Active Elements</h3>
                  <span className="analytics-card-icon">🖱️</span>
                </div>
                <div className="card-body">
                  <div className="analytics-stat-number">
                    {Object.keys(analytics.elementTypes).length}
                  </div>
                  <p className="analytics-stat-description">
                    Different element types tracked
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-2 gap-lg">
              {/* Top Interaction Types */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-icon">🖱️</span>
                    Top Interaction Types
                  </h2>
                </div>
                <div className="card-body">
                  <div className="analytics-list">
                    {getTopInteractions().map(([type, count]) => (
                      <div key={type} className="analytics-list-item">
                        <div className="analytics-item-info">
                          <div className="analytics-item-indicator primary"></div>
                          <span className="analytics-item-label">
                            {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </div>
                        <span className="analytics-item-value">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Error Types */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-icon">⚠️</span>
                    Top Error Types
                  </h2>
                </div>
                <div className="card-body">
                  <div className="analytics-list">
                    {getTopErrors().map(([type, count]) => (
                      <div key={type} className="analytics-list-item">
                        <div className="analytics-item-info">
                          <div className="analytics-item-indicator error"></div>
                          <span className="analytics-item-label">
                            {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </div>
                        <span className="analytics-item-value">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Element Types */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-icon">📝</span>
                    Most Interacted Elements
                  </h2>
                </div>
                <div className="card-body">
                  <div className="analytics-list">
                    {getTopElements().map(([element, count]) => (
                      <div key={element} className="analytics-list-item">
                        <div className="analytics-item-info">
                          <div className="analytics-item-indicator secondary"></div>
                          <span className="analytics-item-label">
                            {element}
                          </span>
                        </div>
                        <span className="analytics-item-value">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-icon">⏰</span>
                    Recent Activity
                  </h2>
                </div>
                <div className="card-body">
                  <div className="analytics-list">
                    {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
                      <div key={index} className="analytics-list-item">
                        <div className="analytics-item-info">
                          <div className="analytics-item-indicator primary"></div>
                          <span className="analytics-item-label">
                            {interaction.type} on {interaction.element}
                          </span>
                        </div>
                        <span className="analytics-item-time">
                          {new Date(interaction.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Errors */}
            {analytics.recentErrors.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-icon">⚠️</span>
                    Recent Errors
                  </h2>
                </div>
                <div className="card-body">
                  <div className="analytics-errors">
                    {analytics.recentErrors.slice(0, 10).map((error, index) => (
                      <div key={index} className="analytics-error-item">
                        <div className="analytics-error-header">
                          <span className="analytics-error-message">
                            {error.message}
                          </span>
                          <span className="analytics-error-time">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="analytics-error-details">
                          Type: {error.type} • Page: {error.page}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 