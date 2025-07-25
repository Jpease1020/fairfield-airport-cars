'use client';

import React from 'react';
import { StatCard } from '@/components/ui';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your business.</p>
        <div className="header-actions">
          <a className="btn btn-outline" href="/admin/bookings">View All Bookings</a>
          <a className="btn btn-primary" href="/admin/calendar">Calendar</a>
        </div>
      </div>

      <section className="stats-section">
        <div className="grid grid-4">
          <StatCard
            title="Total Bookings"
            icon="📊"
            statNumber="24"
            statChange="+12% from last month"
            changeType="positive"
          />
          <StatCard
            title="Active Drivers"
            icon="👥"
            statNumber="8"
            statChange="+2 from last week"
            changeType="positive"
          />
          <StatCard
            title="Revenue"
            icon="💰"
            statNumber="$12,450"
            statChange="+8% from last month"
            changeType="positive"
          />
          <StatCard
            title="Customer Rating"
            icon="⭐"
            statNumber="4.9/5"
            statChange="+0.2 from last month"
            changeType="positive"
          />
        </div>
      </section>

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

      <section className="actions-section">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
            <p className="card-description">Common tasks and shortcuts</p>
          </div>
          <div className="card-body">
            <div className="grid grid-4">
              <a className="action-card" href="/admin/bookings">
                <div className="action-icon">📅</div>
                <span className="action-label">Manage Bookings</span>
              </a>
              <a className="action-card" href="/admin/calendar">
                <div className="action-icon">📆</div>
                <span className="action-label">View Calendar</span>
              </a>
              <a className="action-card" href="/admin/drivers">
                <div className="action-icon">👥</div>
                <span className="action-label">Manage Drivers</span>
              </a>
              <a className="action-card" href="/admin/feedback">
                <div className="action-icon">💬</div>
                <span className="action-label">View Feedback</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 