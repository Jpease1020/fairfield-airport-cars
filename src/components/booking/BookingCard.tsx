import React from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Container, H3, Text, EditableText } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onAction?: (action: 'edit' | 'cancel' | 'view') => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  showActions = false,
  onAction
}) => {


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
    <Container>
      {/* Header */}
      <Stack direction="horizontal" align="center" justify="between" spacing="md">
        <H3>
          {booking.name}
        </H3>
        <Text>
          <EditableText field="bookingCard.bookingNumber" defaultValue={`Booking #${booking.id}`}>
            Booking #{booking.id}
          </EditableText>
        </Text>
        <Badge>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </Stack>

      {/* Date and Time */}
      <Stack direction="horizontal" spacing="md">
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <Calendar />
            <Text size="sm">{formatDate(booking.pickupDateTime.toString())}</Text>
          </Stack>
        </Container>
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <Clock />
            <Text size="sm">{formatTime(booking.pickupDateTime.toString())}</Text>
          </Stack>
        </Container>
      </Stack>

      {/* Locations */}
      <Stack spacing="md">
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <MapPin />
            <Stack direction="vertical" spacing="xs">
              <Text size="xs">
                <EditableText field="bookingCard.pickupLabel" defaultValue="Pickup:">
                  Pickup:
                </EditableText>
              </Text>
              <Text size="sm">{booking.pickupLocation}</Text>
            </Stack>
          </Stack>
        </Container>
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <MapPin />
            <Stack direction="vertical" spacing="xs">
              <Text size="xs">
                <EditableText field="bookingCard.dropoffLabel" defaultValue="Drop-off:">
                  Drop-off:
                </EditableText>
              </Text>
              <Text size="sm">{booking.dropoffLocation}</Text>
            </Stack>
          </Stack>
        </Container>
      </Stack>

      {/* Passenger Info */}
      <Container>
        <Text size="sm">
          <EditableText field="bookingCard.passengersLabel" defaultValue={`Passengers: ${booking.passengers}`}>
            Passengers: {booking.passengers}
          </EditableText>
        </Text>
        {booking.notes && (
                      <Container>
              <Text size="xs">
                <EditableText field="bookingCard.notesLabel" defaultValue="Notes:">
                  Notes:
                </EditableText>
              </Text>
              <Text size="sm">{booking.notes}</Text>
            </Container>
        )}
      </Container>

      {/* Price */}
      <Stack direction="horizontal" align="center" spacing="sm">
        <DollarSign />
        <Text size="sm">
          <EditableText field="bookingCard.totalFareLabel" defaultValue="Total Fare:">
            Total Fare:
          </EditableText>
        </Text>
        <Text size="lg">
          ${booking.fare}
        </Text>
      </Stack>

      {/* Actions */}
      {showActions && onAction && (
        <Stack direction="horizontal" spacing="sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction('view')}
          >
            <EditableText field="bookingCard.viewDetailsButton" defaultValue="View Details">
              View Details
            </EditableText>
          </Button>
          {booking.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('edit')}
              >
                <EditableText field="bookingCard.editButton" defaultValue="Edit">
                  Edit
                </EditableText>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('cancel')}
              >
                <EditableText field="bookingCard.cancelButton" defaultValue="Cancel">
                  Cancel
                </EditableText>
              </Button>
            </>
          )}
        </Stack>
      )}
    </Container>
  );
};

export { BookingCard }; 