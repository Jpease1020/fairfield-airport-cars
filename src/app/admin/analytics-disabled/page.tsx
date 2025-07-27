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
      <Container >
        <Container >
          <Container>🔄</Container>
          <Text>Loading analytics...</Text>
        </Container>
      </Container>
    );
  }

  return (
    <Container >
      <Container >
        <H1>Analytics Dashboard</H1>
        <Text>User interactions, errors, and performance metrics</Text>
        <Container >
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <Span>🔄</Span>
            Refresh
          </Button>
        </Container>
      </Container>
      
      {lastUpdated && (
        <Container>
          <Text>Last updated: {lastUpdated.toLocaleString()}</Text>
        </Container>
      )}

      <Container >
        {!analytics ? (
          <Container >
            <Container >
              <Container >
                <Container >⚠️</Container>
                <H3>No Analytics Data</H3>
                <Text>Analytics data will appear here once users start interacting with the app.</Text>
              </Container>
            </Container>
          </Container>
        ) : (
          <Container>
            {/* Overview Cards */}
            <Container>
              <Container >
                <Container >
                  <H3 >Total Interactions</H3>
                  <Span >📊</Span>
                </Container>
                <Container >
                  <Container >{analytics.totalInteractions.toLocaleString()}</Container>
                  <Text >
                    All user interactions tracked
                  </Text>
                </Container>
              </Container>

              <Container >
                <Container >
                  <H3 >Total Errors</H3>
                  <Span>⚠️</Span>
                </Container>
                <Container >
                  <Container>
                    {analytics.totalErrors.toLocaleString()}
                  </Container>
                  <Text >
                    Errors detected and tracked
                  </Text>
                </Container>
              </Container>

              <Container >
                <Container >
                  <H3 >Error Rate</H3>
                  <Span >📉</Span>
                </Container>
                <Container >
                  <Container >
                    {analytics.totalInteractions > 0 
                      ? ((analytics.totalErrors / analytics.totalInteractions) * 100).toFixed(2)
                      : '0'
                    }%
                  </Container>
                  <Text >
                    Percentage of interactions with errors
                  </Text>
                </Container>
              </Container>

              <Container >
                <Container >
                  <H3 >Active Elements</H3>
                  <Span >🖱️</Span>
                </Container>
                <Container >
                  <Container >
                    {Object.keys(analytics.elementTypes).length}
                  </Container>
                  <Text >
                    Different element types tracked
                  </Text>
                </Container>
              </Container>
            </Container>

            {/* Detailed Metrics */}
            <Container>
              {/* Top Interaction Types */}
              <Container >
                <Container >
                  <H2 >
                    <Span >🖱️</Span>
                    Top Interaction Types
                  </H2>
                </Container>
                <Container >
                  <Container >
                    {getTopInteractions().map(([type, count]) => (
                      <Container key={type} >
                        <Container >
                          <div ></div>
                          <Span >
                            {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Span>
                        </Container>
                        <Span >
                          {count.toLocaleString()}
                        </Span>
                      </Container>
                    ))}
                  </Container>
                </Container>
              </Container>

              {/* Top Error Types */}
              <Container >
                <Container >
                  <H2 >
                    <Span >⚠️</Span>
                    Top Error Types
                  </H2>
                </Container>
                <Container >
                  <Container >
                    {getTopErrors().map(([type, count]) => (
                      <Container key={type} >
                        <Container >
                          <div></div>
                          <Span >
                            {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Span>
                        </Container>
                        <Span >
                          {count.toLocaleString()}
                        </Span>
                      </Container>
                    ))}
                  </Container>
                </Container>
              </Container>

              {/* Top Element Types */}
              <Container >
                <Container >
                  <H2 >
                    <Span >📝</Span>
                    Most Interacted Elements
                  </H2>
                </Container>
                <Container >
                  <Container >
                    {getTopElements().map(([element, count]) => (
                      <Container key={element} >
                        <Container >
                          <div></div>
                          <Span >
                            {element}
                          </Span>
                        </Container>
                        <Span >
                          {count.toLocaleString()}
                        </Span>
                      </Container>
                    ))}
                  </Container>
                </Container>
              </Container>

              {/* Recent Activity */}
              <Container >
                <Container >
                  <H2 >
                    <Span >⏰</Span>
                    Recent Activity
                  </H2>
                </Container>
                <Container >
                  <Container >
                    {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
                      <Container key={index} >
                        <Container >
                          <div ></div>
                          <Span >
                            {interaction.type} on {interaction.element}
                          </Span>
                        </Container>
                        <Span>
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
              <Container >
                <Container >
                  <H2 >
                    <Span >⚠️</Span>
                    Recent Errors
                  </H2>
                </Container>
                <Container >
                  <Container>
                    {analytics.recentErrors.slice(0, 10).map((error, index) => (
                      <Container key={index}>
                        <Container>
                          <Span>
                            {error.message}
                          </Span>
                          <Span>
                            {new Date(error.timestamp).toLocaleString()}
                          </Span>
                        </Container>
                        <Text>
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