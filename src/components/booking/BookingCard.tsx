import React from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {booking.name}
          </h3>
          <p className="text-sm text-text-secondary">
            Booking #{booking.id}
          </p>
        </div>
        <Badge className={getStatusColor(booking.status)}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      {/* Date and Time */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(booking.pickupDateTime.toString())}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Clock className="w-4 h-4" />
          <span>{formatTime(booking.pickupDateTime.toString())}</span>
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 text-success" />
          <div>
            <span className="font-medium text-text-primary">Pickup:</span>
            <span className="ml-1 text-text-secondary">{booking.pickupLocation}</span>
          </div>
        </div>
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 text-error" />
          <div>
            <span className="font-medium text-text-primary">Drop-off:</span>
            <span className="ml-1 text-text-secondary">{booking.dropoffLocation}</span>
          </div>
        </div>
      </div>

      {/* Passenger Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <span>Passengers: {booking.passengers}</span>
        </div>
        {booking.notes && (
          <div className="text-sm text-text-secondary">
            <span className="font-medium">Notes:</span> {booking.notes}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center justify-between pt-2 border-t border-border-primary">
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <DollarSign className="w-4 h-4" />
          <span>Total Fare:</span>
          <span className="text-lg font-semibold text-text-primary">
            ${booking.fare}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && onAction && (
        <div className="flex items-center space-x-2 pt-4 border-t border-border-primary">
          <button
            onClick={() => onAction('view')}
            className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium"
          >
            View Details
          </button>
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onAction('edit')}
                className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onAction('cancel')}
                className="text-sm text-error hover:text-error-hover font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export { BookingCard }; 