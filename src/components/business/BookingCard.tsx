import React from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Badge } from '@/design/components/base-components/Badge';
import { Button } from '@/design/components/base-components/Button';
import { Container } from '@/design/layout/containers/Container';
import { H3 } from '@/design/components/base-components/text/Headings';
import { Text } from '@/design/components/base-components/text/Text';
import { Stack } from '@/design/layout/framing/Stack';
import { Box } from '@/design/layout/content/Box';
import { useCMSData } from '@/design/providers/CMSDataProvider';

// Define Booking interface locally for this component
interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
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
  flightInfo?: {
    airline?: string;
    flightNumber?: string;
    arrivalTime?: string;
    terminal?: string;
  };
  totalFare?: number;
}

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onAction?: (action: 'edit' | 'cancel' | 'view') => void;
  cmsData: any;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  showActions = false,
  onAction,
  cmsData
}) => {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.booking || {};

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
          {pageCmsData?.['bookingCard-customerName'] || booking.name}
        </H3>
        <Text>
          {pageCmsData?.['bookingCard-bookingNumber'] || `Booking #${booking.id}`}
        </Text>
        <Badge>
          {pageCmsData?.['bookingCard-status'] || booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </Stack>

      {/* Date and Time */}
      <Stack direction="horizontal" spacing="md">
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <Calendar />
            <Text size="sm">
              {pageCmsData?.['bookingCard-date'] || formatDate(booking.pickupDateTime.toString())}
            </Text>
          </Stack>
        </Container>
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <Clock />
            <Text size="sm">
              {pageCmsData?.['bookingCard-time'] || formatTime(booking.pickupDateTime.toString())}
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
                {pageCmsData?.['bookingCard-pickupLabel'] || 'Pickup:'}
              </Text>
              <Text size="sm">
                {pageCmsData?.['bookingCard-pickupLocation'] || booking.pickupLocation}
              </Text>
            </Stack>
          </Stack>
        </Container>
        <Container>
          <Stack direction="horizontal" align="center" spacing="sm">
            <MapPin />
            <Stack direction="vertical" spacing="xs">
              <Text size="xs">
                {pageCmsData?.['bookingCard-dropoffLabel'] || 'Drop-off:'}
              </Text>
              <Text size="sm">
                {pageCmsData?.['bookingCard-dropoffLocation'] || booking.dropoffLocation}
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Stack>

      {/* Notes */}
      {booking.notes && (
        <Container>
          <Text size="xs">
              {pageCmsData?.['bookingCard-notesLabel'] || 'Notes:'}
          </Text>
          <Text size="sm">
            {pageCmsData?.['bookingCard-notes'] || booking.notes}
          </Text>
        </Container>
      )}

      {/* Price */}
      <Stack direction="horizontal" align="center" spacing="sm">
        <DollarSign />
        <Text size="sm">
          {pageCmsData?.['bookingCard-totalFareLabel'] || 'Total Fare:'}
        </Text>
        <Text size="lg">
          {pageCmsData?.['bookingCard-fare'] || `$${booking.fare}`}
        </Text>
      </Stack>

      {/* Actions */}
      {showActions && onAction && (
        <Stack direction="horizontal" spacing="sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction('view')}
            cmsId="booking-card-view-button"
            
            text={pageCmsData?.['bookingCard-viewDetailsButton'] || 'View Details'}
          />
          {booking.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('edit')}
                cmsId="booking-card-edit-button"
                
                text={pageCmsData?.['bookingCard-editButton'] || 'Edit'}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('cancel')}
                cmsId="booking-card-cancel-button"
                
                text={pageCmsData?.['bookingCard-cancelButton'] || 'Cancel'}
              />
            </>
          )}
        </Stack>
      )}
          </Box>
  );
};

export { BookingCard }; 