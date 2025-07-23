'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/data';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Car,
  Star,
  Calendar,
  User,
  Settings,
  History,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface CustomerBooking {
  id: string;
  name: string;
  phone: string;
  email: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fare: number;
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  createdAt: string;
  rating?: number;
  feedback?: string;
}

export default function CustomerPortal() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    // Mock data - will be replaced with real API call
    const mockBookings: CustomerBooking[] = [
      {
        id: '1',
        name: 'John Doe',
        phone: '(203) 555-0123',
        email: 'john@example.com',
        pickupAddress: '123 Main St, Fairfield, CT',
        dropoffAddress: 'JFK Airport, New York, NY',
        pickupDateTime: '2024-01-20T10:00:00Z',
        status: 'confirmed',
        fare: 85.00,
        driver: {
          name: 'Sarah Johnson',
          phone: '(203) 555-0456',
          vehicle: '2021 Honda Accord - Black'
        },
        createdAt: '2024-01-19T15:30:00Z'
      },
      {
        id: '2',
        name: 'John Doe',
        phone: '(203) 555-0123',
        email: 'john@example.com',
        pickupAddress: '456 Oak Ave, Fairfield, CT',
        dropoffAddress: 'LaGuardia Airport, New York, NY',
        pickupDateTime: '2024-01-15T08:00:00Z',
        status: 'completed',
        fare: 75.00,
        driver: {
          name: 'Mike Wilson',
          phone: '(203) 555-0789',
          vehicle: '2022 Toyota Camry - Silver'
        },
        createdAt: '2024-01-14T12:00:00Z',
        rating: 5,
        feedback: 'Excellent service! Driver was on time and very professional.'
      }
    ];

    setBookings(mockBookings);
    setLoading(false);
  }, []);

  const currentBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-warning text-warning-dark';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading your portal..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Customer Portal" 
        subtitle="Manage your bookings and track your rides."
      />

      <PageContent>
        {/* Customer Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-primary">{bookings[0]?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-primary">{bookings[0]?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-primary">{bookings[0]?.email}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Current Rides</p>
                  <p className="text-2xl font-bold text-text-primary">{currentBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Completed</p>
                  <p className="text-2xl font-bold text-text-primary">{completedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Avg Rating</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {completedBookings.length > 0 
                      ? (completedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / completedBookings.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Total Spent</p>
                  <p className="text-2xl font-bold text-text-primary">
                    ${bookings.reduce((sum, b) => sum + b.fare, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Tabs */}
        <div className="mb-6">
          <div className="border-b border-border-primary">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'current'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-primary'
                }`}
              >
                Current Rides ({currentBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-primary'
                }`}
              >
                Completed ({completedBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cancelled'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-primary'
                }`}
              >
                Cancelled ({cancelledBookings.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {(activeTab === 'current' ? currentBookings : 
            activeTab === 'completed' ? completedBookings : 
            cancelledBookings).map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {new Date(booking.pickupDateTime).toLocaleDateString()} at {new Date(booking.pickupDateTime).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-text-secondary" />
                          <span className="text-sm font-medium text-text-primary">Pickup</span>
                        </div>
                        <p className="text-sm text-text-secondary">{booking.pickupAddress}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-text-secondary" />
                          <span className="text-sm font-medium text-text-primary">Dropoff</span>
                        </div>
                        <p className="text-sm text-text-secondary">{booking.dropoffAddress}</p>
                      </div>
                    </div>

                    {booking.driver && (
                      <div className="mb-4 p-3 bg-bg-secondary rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Car className="h-4 w-4 text-text-secondary" />
                          <span className="text-sm font-medium text-text-primary">Your Driver</span>
                        </div>
                        <div className="text-sm text-text-secondary">
                          <p>{booking.driver.name} - {booking.driver.vehicle}</p>
                          <p>Phone: {booking.driver.phone}</p>
                        </div>
                      </div>
                    )}

                    {booking.rating && (
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-warning" />
                        <span className="text-sm text-text-primary">Rating: {booking.rating}/5</span>
                      </div>
                    )}

                    {booking.feedback && (
                      <p className="text-sm text-text-secondary italic">"{booking.feedback}"</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-text-primary">${booking.fare}</p>
                      <p className="text-sm text-text-secondary">Total Fare</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button variant="outline" size="sm">
                          Contact Driver
                        </Button>
                      )}
                      {booking.status === 'completed' && !booking.rating && (
                        <Button size="sm">
                          Rate Ride
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {(activeTab === 'current' ? currentBookings : 
            activeTab === 'completed' ? completedBookings : 
            cancelledBookings).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No {activeTab} rides</h3>
                <p className="text-text-secondary mb-4">
                  {activeTab === 'current' 
                    ? "You don't have any current rides. Book a new ride to get started!"
                    : activeTab === 'completed'
                    ? "You haven't completed any rides yet."
                    : "You haven't cancelled any rides."
                  }
                </p>
                {activeTab === 'current' && (
                  <Link href="/book">
                    <Button>Book a Ride</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/book">
              <Button className="w-full h-20">
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm">Book New Ride</span>
                </div>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-20">
              <div className="text-center">
                <Settings className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Update Profile</span>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full h-20">
              <div className="text-center">
                <Mail className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Contact Support</span>
              </div>
            </Button>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
} 