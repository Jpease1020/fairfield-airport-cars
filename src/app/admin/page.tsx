'use client';

import React from 'react';
import { 
  AdminPageWrapper,
  StatCard, 
  InfoCard, 
  ActivityList, 
  AlertList, 
  ActionGrid,
  GridSection
} from '@/components/ui';

export default function AdminDashboard() {
  // Data for components
  const headerActions = [
    { 
      label: 'View All Bookings', 
      href: '/admin/bookings', 
      variant: 'outline' as const,
      icon: '📅'
    },
    { 
      label: 'Calendar View', 
      href: '/admin/calendar', 
      variant: 'primary' as const,
      icon: '📆'
    }
  ];

  const recentBookings = [
    {
      id: 1,
      icon: "✅",
      iconType: "success" as const,
      title: "John Smith → JFK Airport",
      subtitle: "Today, 2:30 PM",
      amount: "$85"
    },
    {
      id: 2,
      icon: "⏱️",
      iconType: "pending" as const,
      title: "Sarah Johnson → LaGuardia",
      subtitle: "Today, 4:15 PM",
      amount: "$75"
    },
    {
      id: 3,
      icon: "✅",
      iconType: "success" as const,
      title: "Mike Davis → Newark",
      subtitle: "Yesterday, 1:45 PM",
      amount: "$95"
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      icon: "⚠️",
      type: "warning" as const,
      title: "Driver Availability Low",
      message: "Only 2 drivers available for tomorrow"
    },
    {
      id: 2,
      icon: "✅",
      type: "success" as const,
      title: "Payment System Online",
      message: "All payment methods working normally"
    },
    {
      id: 3,
      icon: "📈",
      type: "info" as const,
      title: "Revenue Target Met",
      message: "Monthly revenue target achieved"
    }
  ];

  const quickActions = [
    {
      id: 1,
      icon: "📅",
      label: "Manage Bookings",
      href: "/admin/bookings"
    },
    {
      id: 2,
      icon: "📆",
      label: "View Calendar",
      href: "/admin/calendar"
    },
    {
      id: 3,
      icon: "👥",
      label: "Manage Drivers",
      href: "/admin/drivers"
    },
    {
      id: 4,
      icon: "💬",
      label: "View Feedback",
      href: "/admin/feedback"
    }
  ];

  return (
    <AdminPageWrapper
      title="Admin Dashboard"
      subtitle="Welcome back! Here's what's happening with your business."
      actions={headerActions}
      loading={false}
      error={null}
    >
      {/* Business Stats Overview */}
      <GridSection variant="stats" columns={4}>
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
      </GridSection>

      {/* Activity and Alerts */}
      <GridSection variant="activity" columns={2}>
        <InfoCard
          title="📋 Recent Bookings"
          description="Latest customer bookings and their status"
        >
          <ActivityList activities={recentBookings} />
        </InfoCard>

        <InfoCard
          title="🔔 System Alerts"
          description="Important notifications and updates"
        >
          <AlertList alerts={systemAlerts} />
        </InfoCard>
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="🎯 Quick Actions"
          description="Common tasks and shortcuts for efficient management"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
} 