'use client';

import { useState, useEffect } from 'react';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';
import Link from 'next/link';

const CostsPage = () => {
  const [costs, setCosts] = useState<RealCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      const costsData = await realCostTrackingService.getCosts();
      setCosts(costsData);
      
      const summaryData = await realCostTrackingService.getRealCostSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading costs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading cost data...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (cost: RealCostItem) => {
    if (cost.actualMonthlyCost === 0) return '⏱️';
    if (cost.actualMonthlyCost > cost.projectedMonthlyCost) return '❌';
    return '✅';
  };

  const getDataSourceColor = (dataSource: string) => {
    switch (dataSource) {
      case 'api': return 'status-badge confirmed';
      case 'manual': return 'status-badge pending';
      case 'estimated': return 'badge';
      default: return 'badge';
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Cost Tracking</h1>
        <p className="page-subtitle">Monitor your business expenses and projected costs</p>
      </div>

      <div className="standard-content">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-4 gap-lg">
            <div className="card">
              <div className="card-body">
                <div className="stat-display">
                  <div className="stat-content">
                    <div className="stat-label">Total Monthly</div>
                    <div className="stat-number">
                      ${summary.totalActualMonthly.toFixed(2)}
                    </div>
                  </div>
                  <div className="stat-icon">💰</div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="stat-display">
                  <div className="stat-content">
                    <div className="stat-label">Yearly Total</div>
                    <div className="stat-number">
                      ${summary.totalYearly.toFixed(2)}
                    </div>
                  </div>
                  <div className="stat-icon">📈</div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="stat-display">
                  <div className="stat-content">
                    <div className="stat-label">Services</div>
                    <div className="stat-number">{costs.length}</div>
                  </div>
                  <div className="stat-icon">🧾</div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="stat-display">
                  <div className="stat-content">
                    <div className="stat-label">Last Updated</div>
                    <div className="stat-date">
                      {new Date(summary.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="stat-icon">⏰</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="form-actions">
          <Link href="/admin/costs/manual-entry" className="btn btn-primary">
            Add Manual Cost
          </Link>
          <button className="btn btn-outline" onClick={loadCosts}>
            Refresh Data
          </button>
        </div>

        {/* Cost List */}
        <div className="grid grid-1 gap-lg">
          {costs.map((cost) => (
            <div key={cost.id} className="card">
              <div className="card-body">
                <div className="cost-header">
                  <div className="cost-info">
                    <div className="cost-title-row">
                      <h3 className="card-title">{cost.service}</h3>
                      <span className={getDataSourceColor(cost.dataSource)}>
                        {cost.dataSource}
                      </span>
                      <span className="status-icon">{getStatusIcon(cost)}</span>
                    </div>
                    
                    <p className="card-description">{cost.description}</p>
                    
                    <div className="cost-details grid-3">
                      <div className="detail-item">
                        <div className="detail-label">Provider</div>
                        <div className="detail-value">{cost.provider}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Plan</div>
                        <div className="detail-value">{cost.plan}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Billing Cycle</div>
                        <div className="detail-value">{cost.billingCycle}</div>
                      </div>
                    </div>
                    
                    {cost.notes && (
                      <div className="cost-notes">
                        <p>{cost.notes}</p>
                      </div>
                    )}
                    
                    <div className="cost-amounts grid-2">
                      <div className="amount-item">
                        <div className="amount-label">Actual Monthly Cost</div>
                        <div className="amount-value">
                          ${cost.actualMonthlyCost.toFixed(2)}
                        </div>
                      </div>
                      <div className="amount-item">
                        <div className="amount-label">Projected Monthly Cost</div>
                        <div className="amount-value">
                          ${cost.projectedMonthlyCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostsPage; 