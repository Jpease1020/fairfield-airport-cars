'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="section-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your business.</p>
        <div className="header-actions">
          <Link href="/admin/bookings" className="btn btn-outline">View All Bookings</Link>
          <Link href="/admin/calendar" className="btn btn-primary">Calendar</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="grid grid-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Total Bookings</h3>
              <span className="card-icon">📊</span>
            </div>
            <div className="card-body">
              <div className="stat-number">24</div>
              <p className="stat-change positive">+12% from last month</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Active Drivers</h3>
              <span className="card-icon">👥</span>
            </div>
            <div className="card-body">
              <div className="stat-number">8</div>
              <p className="stat-change positive">+2 from last week</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Revenue</h3>
              <span className="card-icon">💰</span>
            </div>
            <div className="card-body">
              <div className="stat-number">$12,450</div>
              <p className="stat-change positive">+8% from last month</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Customer Rating</h3>
              <span className="card-icon">⭐</span>
            </div>
            <div className="card-body">
              <div className="stat-number">4.9/5</div>
              <p className="stat-change positive">+0.2 from last month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="activity-section">
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Bookings</h3>
              <p className="card-description">Latest customer bookings and their status</p>
            </div>
            <div className="card-body">
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon success">✅</div>
                  <div className="activity-content">
                    <p className="activity-title">John Smith → JFK Airport</p>
                    <p className="activity-time">Today, 2:30 PM</p>
                  </div>
                  <div className="activity-amount">$85</div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon pending">⏱️</div>
                  <div className="activity-content">
                    <p className="activity-title">Sarah Johnson → LaGuardia</p>
                    <p className="activity-time">Today, 4:15 PM</p>
                  </div>
                  <div className="activity-amount">$75</div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon success">✅</div>
                  <div className="activity-content">
                    <p className="activity-title">Mike Davis → Newark</p>
                    <p className="activity-time">Yesterday, 1:45 PM</p>
                  </div>
                  <div className="activity-amount">$95</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">System Alerts</h3>
              <p className="card-description">Important notifications and updates</p>
            </div>
            <div className="card-body">
              <div className="alert-list">
                <div className="alert-item warning">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <p className="alert-title">Driver Availability Low</p>
                    <p className="alert-message">Only 2 drivers available for tomorrow</p>
                  </div>
                </div>
                
                <div className="alert-item success">
                  <div className="alert-icon">✅</div>
                  <div className="alert-content">
                    <p className="alert-title">Payment System Online</p>
                    <p className="alert-message">All payment methods working normally</p>
                  </div>
                </div>
                
                <div className="alert-item info">
                  <div className="alert-icon">📈</div>
                  <div className="alert-content">
                    <p className="alert-title">Revenue Target Met</p>
                    <p className="alert-message">Monthly revenue target achieved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
            <p className="card-description">Common tasks and shortcuts</p>
          </div>
          <div className="card-body">
            <div className="grid grid-4">
              <Link href="/admin/bookings" className="action-card">
                <div className="action-icon">📅</div>
                <span className="action-label">Manage Bookings</span>
              </Link>
              
              <Link href="/admin/calendar" className="action-card">
                <div className="action-icon">📆</div>
                <span className="action-label">View Calendar</span>
              </Link>
              
              <Link href="/admin/drivers" className="action-card">
                <div className="action-icon">👥</div>
                <span className="action-label">Manage Drivers</span>
              </Link>
              
              <Link href="/admin/feedback" className="action-card">
                <div className="action-icon">💬</div>
                <span className="action-label">View Feedback</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 