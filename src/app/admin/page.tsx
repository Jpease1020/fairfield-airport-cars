'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/bookings">
            <Button variant="outline">View All Bookings</Button>
          </Link>
          <Link href="/admin/calendar">
            <Button>Calendar</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookOpen className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">24</div>
            <p className="text-xs text-text-secondary">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">8</div>
            <p className="text-xs text-text-secondary">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">$12,450</div>
            <p className="text-xs text-text-secondary">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">4.9/5</div>
            <p className="text-xs text-text-secondary">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest customer bookings and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">John Smith → JFK Airport</p>
                  <p className="text-sm text-text-secondary">Today, 2:30 PM</p>
                </div>
                <div className="text-sm text-text-secondary">$85</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Sarah Johnson → LaGuardia</p>
                  <p className="text-sm text-text-secondary">Today, 4:15 PM</p>
                </div>
                <div className="text-sm text-text-secondary">$75</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Mike Davis → Newark</p>
                  <p className="text-sm text-text-secondary">Yesterday, 1:45 PM</p>
                </div>
                <div className="text-sm text-text-secondary">$95</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Driver Availability Low</p>
                  <p className="text-sm text-text-secondary">Only 2 drivers available for tomorrow</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Payment System Online</p>
                  <p className="text-sm text-text-secondary">All payment methods working normally</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Revenue Target Met</p>
                  <p className="text-sm text-text-secondary">Monthly revenue target achieved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/bookings">
              <Button variant="outline" className="h-20 flex-col w-full">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Manage Bookings</span>
              </Button>
            </Link>
            
            <Link href="/admin/calendar">
              <Button variant="outline" className="h-20 flex-col w-full">
                <Calendar className="h-6 w-6 mb-2" />
                <span>View Calendar</span>
              </Button>
            </Link>
            
            <Link href="/admin/drivers">
              <Button variant="outline" className="h-20 flex-col w-full">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Drivers</span>
              </Button>
            </Link>
            
            <Link href="/admin/feedback">
              <Button variant="outline" className="h-20 flex-col w-full">
                <MessageSquare className="h-6 w-6 mb-2" />
                <span>View Feedback</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 