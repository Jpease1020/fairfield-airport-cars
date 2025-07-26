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
        <div className="">
          <LoadingSpinner text="Loading booking details..." />
        </div>
      </PageContainer>
    );
  }

  if (error || !booking) {
    return (
      <PageContainer>
        <div className="">
          <div className="">
            <AlertCircle className="" />
            <h2 className="">Booking Not Found</h2>
            <p className="">
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
        return <CheckCircle className="" />;
      case 'cancelled':
        return <XCircle className="" />;
      case 'completed':
        return <CheckCircle className="" />;
      default:
        return <Clock className="" />;
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
        <div className="">
          <Card>
            <CardHeader>
              <div className="">
                <CardTitle className="">Booking #{booking.id}</CardTitle>
                <Badge className={getStatusColor(booking.status)}>
                  <div className="">
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="">
              {/* Trip Details */}
              <div className="">
                <div className="">
                  <div className="">
                    <MapPin className="" />
                    <div>
                      <h3 className="">Pickup Location</h3>
                      <p className="">{booking.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="">
                    <MapPin className="" />
                    <div>
                      <h3 className="">Dropoff Location</h3>
                      <p className="text-gray-600">{booking.dropoffLocation}</p>
                    </div>
                  </div>
                  <div className="">
                    <Calendar className="" />
                    <div>
                      <h3 className="">Pickup Date & Time</h3>
                      <p className="">{formatDateTime(booking.pickupDateTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="">
                                     <div className="">
                     <User className="" />
                     <div>
                       <h3 className="">Passenger</h3>
                       <p className="">{booking.name}</p>
                     </div>
                   </div>
                   <div className="">
                     <Phone className="" />
                     <div>
                       <h3 className="">Phone</h3>
                       <p className="">{booking.phone}</p>
                     </div>
                   </div>
                   <div className="">
                     <Mail className="" />
                     <div>
                       <h3 className="">Email</h3>
                       <p className="">{booking.email}</p>
                     </div>
                   </div>
                </div>
              </div>

              {/* Fare Information */}
              <div className="">
                <div className="">
                  <div className="">
                    <DollarSign className="" />
                    <div>
                      <h3 className="">Total Fare</h3>
                      <p className="">Includes all fees and taxes</p>
                    </div>
                  </div>
                  <div className="">
                    <p className="">${booking.fare?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="">
                <div className="">
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
