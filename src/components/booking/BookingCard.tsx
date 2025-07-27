import React from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import { Container, H3, Text, Span } from '@/components/ui';

interface BookingCardProps {
  booking: Booking;
  className?: string;
  showActions?: boolean;
  onAction?: (action: 'edit' | 'cancel' | 'view') => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  className,
  showActions = false,
  onAction
}) => {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-text-inverse';
      case 'pending':
        return 'bg-warning text-text-inverse';
      case 'completed':
        return 'bg-info text-text-inverse';
      case 'cancelled':
        return 'bg-error text-text-inverse';
      default:
        return 'bg-bg-secondary text-text-primary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Container className={cn(
      'bg-bg-primary border border-border-primary rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      {/* Header */}
      <Container className="flex items-center justify-between mb-4">
        <Container>
          <H3 className="page-title">
            {booking.name}
          </H3>
          <Text className="page-subtitle">
            Booking #{booking.id}
          </Text>
        </Container>
        <Badge className={getStatusColor(booking.status)}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </Container>

      {/* Date and Time */}
      <Container className="space-y-2 mb-4">
        <Container className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <Text className="text-sm">{formatDate(booking.pickupDateTime.toString())}</Text>
        </Container>
        <Container className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <Text className="text-sm">{formatTime(booking.pickupDateTime.toString())}</Text>
        </Container>
      </Container>

      {/* Locations */}
      <Container className="space-y-3 mb-4">
        <Container className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <Container className="flex-1">
            <Text className="text-xs mb-1">Pickup:</Text>
            <Text className="text-sm">{booking.pickupLocation}</Text>
          </Container>
        </Container>
        <Container className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <Container className="flex-1">
            <Text className="text-xs mb-1">Drop-off:</Text>
            <Text className="text-sm">{booking.dropoffLocation}</Text>
          </Container>
        </Container>
      </Container>

      {/* Passenger Info */}
      <Container className="space-y-2 mb-4">
        <Text className="text-sm">
          Passengers: {booking.passengers}
        </Text>
        {booking.notes && (
          <Container>
            <Text className="text-xs mb-1">Notes:</Text>
            <Text className="text-sm">{booking.notes}</Text>
          </Container>
        )}
      </Container>

      {/* Price */}
      <Container className="flex items-center space-x-2 mb-4">
        <DollarSign className="w-4 h-4" />
        <Text className="text-sm">Total Fare:</Text>
        <Text className="text-lg font-semibold">
          ${booking.fare}
        </Text>
      </Container>

      {/* Actions */}
      {showActions && onAction && (
        <Container className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction('view')}
            className="flex-1"
          >
            View Details
          </Button>
          {booking.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('edit')}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('cancel')}
                className="flex-1"
              >
                Cancel
              </Button>
            </>
          )}
        </Container>
      )}
    </Container>
  );
};

export { BookingCard }; 