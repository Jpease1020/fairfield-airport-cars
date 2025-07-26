'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/data';
import { Booking } from '@/types/booking';
import { 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';


  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/get-booking/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBooking();
    }
  }, [params.id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading booking details..." />
        </div>
      </PageContainer>
    );
  }

  if (error || !booking) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || 'The booking you are looking for could not be found.'}
            </p>
            <Link href="/book">
              <Button>Book a New Ride</Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDateTime = (dateTime: Date) => {
    return dateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Booking Details" />
      <PageContent>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Booking #{booking.id}</CardTitle>
                <Badge className={getStatusColor(booking.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trip Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Pickup Location</h3>
                      <p className="text-gray-600">{booking.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Dropoff Location</h3>
                      <p className="text-gray-600">{booking.dropoffLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Pickup Date & Time</h3>
                      <p className="text-gray-600">{formatDateTime(booking.pickupDateTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                                     <div className="flex items-start gap-3">
                     <User className="h-5 w-5 text-purple-500 mt-1" />
                     <div>
                       <h3 className="font-semibold text-gray-900">Passenger</h3>
                       <p className="text-gray-600">{booking.name}</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-3">
                     <Phone className="h-5 w-5 text-gray-500 mt-1" />
                     <div>
                       <h3 className="font-semibold text-gray-900">Phone</h3>
                       <p className="text-gray-600">{booking.phone}</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-3">
                     <Mail className="h-5 w-5 text-gray-500 mt-1" />
                     <div>
                       <h3 className="font-semibold text-gray-900">Email</h3>
                       <p className="text-gray-600">{booking.email}</p>
                     </div>
                   </div>
                </div>
              </div>

              {/* Fare Information */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Total Fare</h3>
                      <p className="text-sm text-gray-600">Includes all fees and taxes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">${booking.fare?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-6">
                <div className="flex gap-4">
                  <Link href={`/manage/${booking.id}`}>
                    <Button variant="outline">
                      Manage Booking
                    </Button>
                  </Link>
                  <Link href={`/status/${booking.id}`}>
                    <Button variant="outline">
                      Check Status
                    </Button>
                  </Link>
                  <Link href="/book">
                    <Button>
                      Book Another Ride
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
