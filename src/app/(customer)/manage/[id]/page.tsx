'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  GridSection,
  ToastProvider,
  useToast,
  Text,
  Container,
  Stack,
  H1,
  H2,
  Button,
  Box,
  LoadingSpinner,  
  Input,
  Label,
  Form
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function ManageBookingPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data);
        } else {
          setError(getCMSField(cmsData, 'bookingNotFound', 'Booking not found'));
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(getCMSField(cmsData, 'loadFailed', 'Failed to load booking'));
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
    fetchBooking();
  }, [bookingId, cmsData]);

  const handleFieldChange = (field: string, value: string) => {
    setLocalContent((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/cms/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 'manage',
          content: localContent
        }),
      });

      if (response.ok) {
        addToast('success', getCMSField(cmsData, 'saveSuccess', 'Content saved successfully'));
        setEditMode(false);
      } else {
        addToast('error', getCMSField(cmsData, 'saveFailed', 'Failed to save content'));
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      addToast('error', getCMSField(cmsData, 'saveFailed', 'Failed to save content'));
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setLocalContent(null);
    addToast('info', getCMSField(cmsData, 'cancelled', 'Changes cancelled'));
  };

  const handleEdit = () => {
    setLocalContent(booking);
    setEditMode(true);
  };

  const handleDelete = async () => {
    if (!confirm(getCMSField(cmsData, 'delete', 'Are you sure you want to delete this booking? This action cannot be undone.'))) {
      return;
    }

    try {
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast('success', getCMSField(cmsData, 'deleteSuccess', 'Booking deleted successfully'));
        router.push('/bookings');
      } else {
        addToast('error', getCMSField(cmsData, 'deleteFailed', 'Failed to delete booking'));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      addToast('error', getCMSField(cmsData, 'deleteFailed', 'Failed to delete booking'));
    }
  };

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner />
              <Text align="center" data-cms-id="loading-message" mode={mode}>
                {getCMSField(cmsData, 'message', 'Loading booking details...')}
              </Text>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <H1 align="center" data-cms-id="error-title" mode={mode}>
                {getCMSField(cmsData, 'title', 'Unable to Load Booking')}
              </H1>
              <Text align="center" data-cms-id="error-description" mode={mode}>
                {getCMSField(cmsData, 'description', 'We could not load the booking details. Please check your booking ID and try again.')}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                data-cms-id="error-view-bookings"
              >
                {getCMSField(cmsData, 'viewBookings', 'View My Bookings')}
              </Button>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <H1 align="center" data-cms-id="no-booking-title" mode={mode}>
                {getCMSField(cmsData, 'title', 'No Booking Found')}
              </H1>
              <Text align="center" data-cms-id="no-booking-description" mode={mode}>
                {getCMSField(cmsData, 'description', 'The booking you are looking for could not be found.')}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                data-cms-id="view-bookings"
              >
                {getCMSField(cmsData, 'view-bookings', 'View My Bookings')}
              </Button>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  return (
    <Container variant="default" padding="none">
      {/* Page Header */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg" align="center">
            <H1 align="center" data-cms-id="title" mode={mode}>
              {getCMSField(cmsData, 'title', 'Manage Booking')}
            </H1>
            <Text align="center" data-cms-id="subtitle" mode={mode}>
              {getCMSField(cmsData, 'subtitle', `Manage your booking #${bookingId}`)}
            </Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 data-cms-id="booking-details-title" mode={mode}>
                {getCMSField(cmsData, 'title', 'Booking Information')}
              </H2>
              
              {editMode ? (
                <Form>
                  <Stack spacing="md">
                    <div data-cms-id="pickup-container">
                      <Label htmlFor="pickupLocation" data-cms-id="form-pickup-location-label" mode={mode}>
                        {getCMSField(cmsData, 'label', 'Pickup Location')}
                      </Label>
                      <Input
                        id="pickupLocation"
                        value={localContent?.pickupLocation || ''}
                        onChange={(e) => handleFieldChange('pickupLocation', e.target.value)}
                        placeholder={getCMSField(cmsData, 'placeholder', 'Enter pickup location')}
                        data-cms-id="form-pickup-location-input"
                      />
                    </div>
                    
                    <div data-cms-id="dropoff-container">
                      <Label htmlFor="dropoffLocation" data-cms-id="form-dropoff-location-label" mode={mode}>
                        {getCMSField(cmsData, 'label', 'Dropoff Location')}
                      </Label>
                      <Input
                        id="dropoffLocation"
                        value={localContent?.dropoffLocation || ''}
                        onChange={(e) => handleFieldChange('dropoffLocation', e.target.value)}
                        placeholder={getCMSField(cmsData, 'placeholder', 'Enter dropoff location')}
                        data-cms-id="form-dropoff-location-input"
                      />
                    </div>
                    
                    <div data-cms-id="label">
                      <Label htmlFor="pickupDateTime" data-cms-id="form-pickup-date-time-label" mode={mode}>
                        {getCMSField(cmsData, 'label', 'Pickup Date & Time')}
                      </Label>
                      <Input
                        id="pickupDateTime"
                        type="datetime-local"
                        value={localContent?.pickupDateTime || ''}
                        onChange={(e) => handleFieldChange('pickupDateTime', e.target.value)}
                        data-cms-id="form-pickup-date-time-input"
                      />
                    </div>
                    
                    <div data-cms-id="backToBookings">
                      <Label htmlFor="notes" data-cms-id="form-notes-label" mode={mode}>
                        {getCMSField(cmsData, 'label', 'Special Notes')}
                      </Label>
                      <Input
                        id="notes"
                        value={localContent?.notes || ''}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        placeholder={getCMSField(cmsData, 'placeholder', 'Any special requests or notes')}
                        data-cms-id="form-notes-input"
                      />
                    </div>
                  </Stack>
                </Form>
              ) : (
                <Stack spacing="md">
                  <Text data-cms-id="booking-details-pickup" mode={mode}>
                    <strong data-cms-id="pickupLabel">{getCMSField(cmsData, 'pickupLabel', 'Pickup:')}</strong> {booking.pickupLocation}
                  </Text>
                  <Text data-cms-id="booking-details-dropoff" mode={mode}>
                    <strong data-cms-id="dropoffLabel">{getCMSField(cmsData, 'dropoffLabel', 'Dropoff:')}</strong> {booking.dropoffLocation}
                  </Text>
                  <Text data-cms-id="booking-details-date-time" mode={mode}>
                    <strong data-cms-id="dateTimeLabel">{getCMSField(cmsData, 'dateTimeLabel', 'Date & Time:')}</strong> {new Date(booking.pickupDateTime).toLocaleString()}
                  </Text>

                  {booking.notes && (
                    <Text data-cms-id="booking-details-notes" mode={mode}>
                      <strong data-cms-id="notesLabel">{getCMSField(cmsData, 'notesLabel', 'Notes:')}</strong> {booking.notes}
                    </Text>
                  )}
                  <Text data-cms-id="booking-details-status" mode={mode}>
                    <strong data-cms-id="statusLabel">{getCMSField(cmsData, 'statusLabel', 'Status:')}</strong> {booking.status}
                  </Text>
                  <Text data-cms-id="booking-details-fare" mode={mode}>
                    <strong data-cms-id="fareLabel">{getCMSField(cmsData, 'fareLabel', 'Fare:')}</strong> ${booking.fare}
                  </Text>
                </Stack>
              )}
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Action Buttons */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md" align="center">
            {editMode ? (
              <Stack direction="horizontal" spacing="md" align="center">
                <Button
                  onClick={handleSave}
                  variant="primary"
                  data-cms-id="actions-save"
                >
                  {getCMSField(cmsData, 'save', 'Save Changes')}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  data-cms-id="actions-cancel"
                >
                  {getCMSField(cmsData, 'cancel', 'Cancel')}
                </Button>
              </Stack>
            ) : (
              <Stack direction="horizontal" spacing="md" align="center">
                <Button
                  onClick={handleEdit}
                  variant="primary"
                  data-cms-id="actions-edit"
                >
                  {getCMSField(cmsData, 'edit', 'Edit Booking')}
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  data-cms-id="actions-delete"
                >
                  {getCMSField(cmsData, 'delete', 'Delete Booking')}
                </Button>
              </Stack>
            )}
            
            <Button
              onClick={() => router.push('/bookings')}
              variant="outline"
              data-cms-id="actions-back-to-bookings"
            >
              {getCMSField(cmsData, 'backToBookings', 'Back to Bookings')}
            </Button>
          </Stack>
        </Container>
      </GridSection>
    </Container>
  );
}

export default function ManageBookingPage() {
  return (
    <ToastProvider>
      <ManageBookingPageContent />
    </ToastProvider>
  );
}
