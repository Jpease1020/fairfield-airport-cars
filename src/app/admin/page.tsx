'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/data';
import { listBookings } from '@/lib/booking-service';
import { Booking } from '@/types/booking';
import { 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsData = await listBookings();
        setBookings(bookingsData);
      } catch {
        // Handle error silently or show a user-friendly message
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      </PageContainer>
    );
  }

  // Calculate metrics
  const today = new Date();
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.pickupDateTime);
    return bookingDate.toDateString() === today.toDateString();
  });

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.fare || 0), 0);
  const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.fare || 0), 0);

  const quickActions = [
    {
      title: 'View All Bookings',
      description: 'Manage and update booking status',
      href: '/admin/bookings',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Calendar View',
      description: 'See bookings in calendar format',
      href: '/admin/calendar',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Manage Promos',
      description: 'Create and manage promotional codes',
      href: '/admin/promos',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'AI Assistant',
      description: 'Get help with your business',
      href: '/admin/ai-assistant',
      icon: Users,
      color: 'bg-orange-500'
    },
    {
      title: 'CMS Settings',
      description: 'Update website content and business info',
      href: '/admin/cms',
      icon: DollarSign,
      color: 'bg-indigo-500'
    },
    {
      title: 'Help & Guide',
      description: 'Learn how to use the admin panel',
      href: '/admin/help',
      icon: Clock,
      color: 'bg-gray-500'
    }
  ];

  return (
            <PageContainer className="bg-bg-secondary">
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Welcome back! Here's what's happening with your business."
      />
      <PageContent>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-bg-info rounded-lg">
                  <BookOpen className="h-6 w-6 text-info" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Today&apos;s Bookings</p>
                  <p className="text-2xl font-bold text-text-primary">{todayBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-bg-warning rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Pending</p>
                  <p className="text-2xl font-bold text-text-primary">{pendingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-bg-success rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Confirmed</p>
                  <p className="text-2xl font-bold text-text-primary">{confirmedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-bg-error rounded-lg">
                  <XCircle className="h-6 w-6 text-error" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Cancelled</p>
                  <p className="text-2xl font-bold text-text-primary">{cancelledBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <DollarSign className="h-5 w-5" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-primary">Total Revenue</span>
                  <span className="font-semibold text-text-primary">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-primary">Today&apos;s Revenue</span>
                  <span className="font-semibold text-text-primary">${todayRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-primary">Completed Rides</span>
                  <span className="font-semibold text-text-primary">{completedBookings.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-text-primary">{booking.name}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(booking.pickupDateTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-text-primary">${booking.fare}</span>
                  </div>
                ))}
                {todayBookings.length === 0 && (
                  <p className="text-text-secondary text-sm">No bookings today</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <IconComponent className="h-6 w-6 text-text-inverse" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-text-primary">{action.title}</h3>
                          <p className="text-sm text-text-secondary">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Recent Bookings</h2>
            <Link href="/admin/bookings">
              <Button variant="outline" size="sm" className="text-text-primary border-border-primary hover:bg-bg-secondary hover:text-text-primary">
                View All
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Fare
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-bg-primary divide-y divide-border-primary">
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="hover:bg-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-text-primary">{booking.name}</div>
                            <div className="text-sm text-text-secondary">{booking.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          {new Date(booking.pickupDateTime).toLocaleDateString()} at{' '}
                          {new Date(booking.pickupDateTime).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed' ? 'bg-bg-success text-success' :
                            booking.status === 'pending' ? 'bg-bg-warning text-warning' :
                            booking.status === 'completed' ? 'bg-bg-info text-info' :
                            'bg-bg-error text-error'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          ${booking.fare}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default AdminDashboard; 