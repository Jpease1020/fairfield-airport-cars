'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/data';
import { 
  Activity, 
  AlertTriangle, 
  MousePointer, 
  FormInput,
  Clock,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

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
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading analytics..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Analytics Dashboard"
        subtitle="User interactions, errors, and performance metrics"
      >
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>
      {lastUpdated && (
        <p className="text-sm text-text-secondary mt-2">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}

      <PageContent>
        {!analytics ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
              <p className="text-text-secondary">
                Analytics data will appear here once users start interacting with the app.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalInteractions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All user interactions tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {analytics.totalErrors.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Errors detected and tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.totalInteractions > 0 
                      ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(2)
                      : '0'
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Percentage of interactions with errors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Elements</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.keys(analytics.elementTypes).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Different element types tracked
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Interaction Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MousePointer className="w-4 h-4 mr-2" />
                    Top Interaction Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTopInteractions().map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-primary rounded-full" />
                          <span className="text-sm font-medium capitalize">
                            {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Error Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Top Error Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTopErrors().map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-destructive rounded-full" />
                          <span className="text-sm font-medium capitalize">
                            {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Element Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FormInput className="w-4 h-4 mr-2" />
                    Most Interacted Elements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTopElements().map(([element, count]) => (
                      <div key={element} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-secondary rounded-full" />
                          <span className="text-sm font-medium capitalize">
                            {element}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="capitalize">
                            {interaction.type} on {interaction.element}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(interaction.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Errors */}
            {analytics.recentErrors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Recent Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recentErrors.slice(0, 10).map((error, index) => (
                      <div key={index} className="border-l-4 border-destructive pl-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-destructive">
                            {error.message}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {error.type} • Page: {error.page}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
} 