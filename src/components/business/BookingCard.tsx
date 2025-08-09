import React from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Badge } from '@/design/components/base-components/Badge';
import { Button } from '@/design/components/base-components/Button';
import { Container } from '@/design/layout/containers/Container';
import { H3 } from '@/design/components/base-components/text/Headings';
import { Text } from '@/design/components/base-components/text/Text';
import { Stack } from '@/design/layout/framing/Stack';
import { Box } from '@/design/layout/content/Box';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

// Define Booking interface locally for this component
interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  passengers: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  fare: number;
  dynamicFare?: number;
  depositPaid: boolean;
  balanceDue: number;
  flightNumber?: string;
  notes?: string;
  driverId?: string;
  driverName?: string;
  estimatedArrival?: Date;
  actualArrival?: Date;
  tipAmount?: number;
  cancellationFee?: number;
  squareOrderId?: string;
  depositAmount?: number;
  reminderSent?: boolean;
  onMyWaySent?: boolean;
  createdAt: Date;
  updatedAt: Date;
  vehicleType?: 'sedan' | 'suv' | 'luxury' | 'van';
  serviceLevel?: 'standard' | 'premium' | 'luxury';
  specialRequests?: {
    childSeat?: boolean;
    wheelchair?: boolean;
    extraLuggage?: boolean;
    meetAndGreet?: boolean;
    flightTracking?: boolean;
  };
  flightInfo?: {
    airline?: string;
    flightNumber?: string;
    arrivalTime?: string;
    terminal?: string;
  };
  vehicleUpgradePrice?: number;
  serviceLevelPrice?: number;
  totalFare?: number;
}

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
  const { cmsData } = useCMSData();

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
          <Box variant="elevated" padding="lg">
      {/* Header */}
      <Stack direction="horizontal" align="center" justify="space-between" spacing="md">
        <H3>
          {getCMSField(cmsData, 'bookingCard.customerName', booking.name)}
        </H3>
        <Text>
          {getCMSField(cmsData, 'bookingCard.bookingNumber', `Booking #${booking.id}`)}
        </Text>
        <Badge>
          {getCMSField(cmsData, 'bookingCard.status', booking.status.charAt(0).toUpperCase() + booking.status.slice(1))}
        </Badge>
      </Stack>

      {/* Date and Time */}
      <Stack direction="horizontal" spacing="md">
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <Calendar />
            <Text size="sm">
              {getCMSField(cmsData, 'bookingCard.date', formatDate(booking.pickupDateTime.toString()))}
            </Text>
          </Stack>
        </Container>
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <Clock />
            <Text size="sm">
              {getCMSField(cmsData, 'bookingCard.time', formatTime(booking.pickupDateTime.toString()))}
            </Text>
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
                {getCMSField(cmsData, 'bookingCard.pickupLabel', 'Pickup:')}
              </Text>
              <Text size="sm">
                {getCMSField(cmsData, 'bookingCard.pickupLocation', booking.pickupLocation)}
              </Text>
            </Stack>
          </Stack>
        </Container>
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <MapPin />
            <Stack direction="vertical" spacing="xs">
              <Text size="xs">
                {getCMSField(cmsData, 'bookingCard.dropoffLabel', 'Drop-off:')}
              </Text>
              <Text size="sm">
                {getCMSField(cmsData, 'bookingCard.dropoffLocation', booking.dropoffLocation)}
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Stack>

      {/* Passenger Info */}
      <Container>
        <Text size="sm">
          {getCMSField(cmsData, 'bookingCard.passengersLabel', `Passengers: ${booking.passengers}`)}
        </Text>
        {booking.notes && (
          <Container>
            <Text size="xs">
                {getCMSField(cmsData, 'bookingCard.notesLabel', 'Notes:')}
            </Text>
            <Text size="sm">
              {getCMSField(cmsData, 'bookingCard.notes', booking.notes)}
            </Text>
          </Container>
        )}
      </Container>

      {/* Price */}
      <Stack direction="horizontal" align="center" spacing="sm">
        <DollarSign />
        <Text size="sm">
          {getCMSField(cmsData, 'bookingCard.totalFareLabel', 'Total Fare:')}
        </Text>
        <Text size="lg">
          {getCMSField(cmsData, 'bookingCard.fare', `$${booking.fare}`)}
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
            {getCMSField(cmsData, 'bookingCard.viewDetailsButton', 'View Details')}
          </Button>
          {booking.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('edit')}
              >
                {getCMSField(cmsData, 'bookingCard.editButton', 'Edit')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('cancel')}
              >
                {getCMSField(cmsData, 'bookingCard.cancelButton', 'Cancel')}
              </Button>
            </>
          )}
        </Stack>
      )}
          </Box>
  );
};

export { BookingCard }; 