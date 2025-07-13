import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/data/StatusBadge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Phone, Mail, Plane } from 'lucide-react';
import { Booking } from '@/types/booking';

interface BookingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  booking: Booking;
  showActions?: boolean;
  onEdit?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onView?: (booking: Booking) => void;
}

const BookingCard = React.forwardRef<HTMLDivElement, BookingCardProps>(
  ({ 
    className, 
    booking, 
    showActions = true,
    onEdit,
    onCancel,
    onView,
    ...props 
  }, ref) => {
    const formatDateTime = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    };

    return (
      <Card
        ref={ref}
        className={cn('hover:shadow-md transition-shadow', className)}
        {...props}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Booking #{booking.id?.slice(-8) || 'N/A'}
            </CardTitle>
            <StatusBadge status={booking.status} />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{booking.name}</span>
            {booking.phone && (
              <>
                <Phone className="w-4 h-4 ml-2" />
                <span>{booking.phone}</span>
              </>
            )}
            {booking.email && (
              <>
                <Mail className="w-4 h-4 ml-2" />
                <span>{booking.email}</span>
              </>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(booking.pickupDateTime)}</span>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-green-600" />
              <div>
                <span className="font-medium text-gray-900">Pickup:</span>
                <span className="ml-1 text-gray-600">{booking.pickupLocation}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-red-600" />
              <div>
                <span className="font-medium text-gray-900">Drop-off:</span>
                <span className="ml-1 text-gray-600">{booking.dropoffLocation}</span>
              </div>
            </div>
          </div>

          {/* Flight Info */}
          {booking.flightNumber && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Plane className="w-4 h-4" />
              <span>Flight: {booking.flightNumber}</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Total Fare:</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(booking.fare)}
            </span>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(booking)}
                  className="flex-1"
                >
                  View Details
                </Button>
              )}
              {onEdit && booking.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(booking)}
                >
                  Edit
                </Button>
              )}
              {onCancel && booking.status !== 'cancelled' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(booking)}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
BookingCard.displayName = 'BookingCard';

export { BookingCard }; 