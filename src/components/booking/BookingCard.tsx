import React from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';

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
    <div className={cn(
      'bg-bg-primary border border-border-primary rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      {/* Header */}
      <div className="">
        <div>
          <h3 className="">
            {booking.name}
          </h3>
          <p className="">
            Booking #{booking.id}
          </p>
        </div>
        <Badge className={getStatusColor(booking.status)}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      {/* Date and Time */}
      <div className="">
        <div className="">
          <Calendar className="" />
          <span>{formatDate(booking.pickupDateTime.toString())}</span>
        </div>
        <div className="">
          <Clock className="" />
          <span>{formatTime(booking.pickupDateTime.toString())}</span>
        </div>
      </div>

      {/* Locations */}
      <div className="">
        <div className="">
          <MapPin className="" />
          <div>
            <span className="">Pickup:</span>
            <span className="">{booking.pickupLocation}</span>
          </div>
        </div>
        <div className="">
          <MapPin className="" />
          <div>
            <span className="">Drop-off:</span>
            <span className="">{booking.dropoffLocation}</span>
          </div>
        </div>
      </div>

      {/* Passenger Info */}
      <div className="">
        <div className="">
          <span>Passengers: {booking.passengers}</span>
        </div>
        {booking.notes && (
          <div className="">
            <span className="">Notes:</span> {booking.notes}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="">
        <div className="">
          <DollarSign className="" />
          <span>Total Fare:</span>
          <span className="">
            ${booking.fare}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && onAction && (
        <div className="">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction('view')}
            className=""
          >
            View Details
          </Button>
          {booking.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('edit')}
                className=""
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('cancel')}
                className=""
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export { BookingCard }; 