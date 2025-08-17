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
  Alert,
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
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        if (response.ok) {
          setIsAdmin(true);
        }
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
          setError(getCMSField(cmsData, 'pages.manage.errors.bookingNotFound', 'Booking not found'));
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(getCMSField(cmsData, 'pages.manage.errors.loadFailed', 'Failed to load booking'));
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
        addToast('success', getCMSField(cmsData, 'pages.manage.messages.saveSuccess', 'Content saved successfully'));
        setEditMode(false);
      } else {
        addToast('error', getCMSField(cmsData, 'pages.manage.messages.saveFailed', 'Failed to save content'));
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      addToast('error', getCMSField(cmsData, 'pages.manage.messages.saveFailed', 'Failed to save content'));
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setLocalContent(null);
    addToast('info', getCMSField(cmsData, 'pages.manage.messages.cancelled', 'Changes cancelled'));
  };

  const handleEdit = () => {
    setLocalContent(booking);
    setEditMode(true);
  };

  const handleDelete = async () => {
    if (!confirm(getCMSField(cmsData, 'pages.manage.confirm.delete', 'Are you sure you want to delete this booking? This action cannot be undone.'))) {
      return;
    }

    try {
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast('success', getCMSField(cmsData, 'pages.manage.messages.deleteSuccess', 'Booking deleted successfully'));
        router.push('/bookings');
      } else {
        addToast('error', getCMSField(cmsData, 'pages.manage.messages.deleteFailed', 'Failed to delete booking'));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      addToast('error', getCMSField(cmsData, 'pages.manage.messages.deleteFailed', 'Failed to delete booking'));
    }
  };

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner />
              <Text align="center" data-cms-id="pages.manage.loading.message" mode={mode}>
                {getCMSField(cmsData, 'pages.manage.loading.message', 'Loading booking details...')}
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
              <H1 align="center" data-cms-id="pages.manage.error.title" mode={mode}>
                {getCMSField(cmsData, 'pages.manage.error.title', 'Unable to Load Booking')}
              </H1>
              <Text align="center" data-cms-id="pages.manage.error.description" mode={mode}>
                {getCMSField(cmsData, 'pages.manage.error.description', 'We could not load the booking details. Please check your booking ID and try again.')}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                data-cms-id="pages.manage.error.viewBookings"
              >
                {getCMSField(cmsData, 'pages.manage.error.viewBookings', 'View My Bookings')}
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
              <H1 align="center" data-cms-id="pages.manage.noBooking.title" mode={mode}>
                {getCMSField(cmsData, 'pages.manage.noBooking.title', 'No Booking Found')}
              </H1>
              <Text align="center" data-cms-id="pages.manage.noBooking.description" mode={mode}>
                {getCMSField(cmsData, 'pages.manage.noBooking.description', 'The booking you are looking for could not be found.')}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                data-cms-id="pages.manage.noBooking.viewBookings"
              >
                {getCMSField(cmsData, 'pages.manage.noBooking.viewBookings', 'View My Bookings')}
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
            <H1 align="center" data-cms-id="pages.manage.title" mode={mode}>
              {getCMSField(cmsData, 'pages.manage.title', 'Manage Booking')}
            </H1>
            <Text align="center" data-cms-id="pages.manage.subtitle" mode={mode}>
              {getCMSField(cmsData, 'pages.manage.subtitle', `Manage your booking #${bookingId}`)}
            </Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Action Messages */}
      {actionMsg && (
        <GridSection variant="content" columns={1}>
          <Container>
            <Alert variant="info" data-cms-id="pages.manage.actionMessage">
              {actionMsg}
            </Alert>
          </Container>
        </GridSection>
      )}

      {/* Booking Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 data-cms-id="pages.manage.bookingDetails.title" mode={mode}>
                {getCMSField(cmsData, 'pages.manage.bookingDetails.title', 'Booking Information')}
              </H2>
              
              {editMode ? (
                <Form>
                  <Stack spacing="md">
                    <div>
                      <Label htmlFor="pickupLocation" data-cms-id="pages.manage.form.pickupLocation.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.manage.form.pickupLocation.label', 'Pickup Location')}
                      </Label>
                      <Input
                        id="pickupLocation"
                        value={localContent?.pickupLocation || ''}
                        onChange={(e) => handleFieldChange('pickupLocation', e.target.value)}
                        placeholder={getCMSField(cmsData, 'pages.manage.form.pickupLocation.placeholder', 'Enter pickup location')}
                        data-cms-id="pages.manage.form.pickupLocation.input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dropoffLocation" data-cms-id="pages.manage.form.dropoffLocation.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.manage.form.dropoffLocation.label', 'Dropoff Location')}
                      </Label>
                      <Input
                        id="dropoffLocation"
                        value={localContent?.dropoffLocation || ''}
                        onChange={(e) => handleFieldChange('dropoffLocation', e.target.value)}
                        placeholder={getCMSField(cmsData, 'pages.manage.form.dropoffLocation.placeholder', 'Enter dropoff location')}
                        data-cms-id="pages.manage.form.dropoffLocation.input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pickupDateTime" data-cms-id="pages.manage.form.pickupDateTime.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.manage.form.pickupDateTime.label', 'Pickup Date & Time')}
                      </Label>
                      <Input
                        id="pickupDateTime"
                        type="datetime-local"
                        value={localContent?.pickupDateTime || ''}
                        onChange={(e) => handleFieldChange('pickupDateTime', e.target.value)}
                        data-cms-id="pages.manage.form.pickupDateTime.input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="passengers" data-cms-id="pages.manage.form.passengers.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.manage.form.passengers.label', 'Number of Passengers')}
                      </Label>
                      <Input
                        id="passengers"
                        type="number"
                        min="1"
                        max="6"
                        value={localContent?.passengers || 1}
                        onChange={(e) => handleFieldChange('passengers', e.target.value)}
                        data-cms-id="pages.manage.form.passengers.input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes" data-cms-id="pages.manage.form.notes.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.manage.form.notes.label', 'Special Notes')}
                      </Label>
                      <Input
                        id="notes"
                        value={localContent?.notes || ''}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        placeholder={getCMSField(cmsData, 'pages.manage.form.notes.placeholder', 'Any special requests or notes')}
                        data-cms-id="pages.manage.form.notes.input"
                      />
                    </div>
                  </Stack>
                </Form>
              ) : (
                <Stack spacing="md">
                  <Text data-cms-id="pages.manage.bookingDetails.pickup" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.manage.bookingDetails.pickupLabel', 'Pickup:')}</strong> {booking.pickupLocation}
                  </Text>
                  <Text data-cms-id="pages.manage.bookingDetails.dropoff" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.manage.bookingDetails.dropoffLabel', 'Dropoff:')}</strong> {booking.dropoffLocation}
                  </Text>
                  <Text data-cms-id="pages.manage.bookingDetails.dateTime" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.manage.bookingDetails.dateTimeLabel', 'Date & Time:')}</strong> {new Date(booking.pickupDateTime).toLocaleString()}
                  </Text>
                  <Text data-cms-id="pages.manage.bookingDetails.passengers" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.manage.bookingDetails.passengersLabel', 'Passengers:')}</strong> {booking.passengers || 1}
                  </Text>
                  {booking.notes && (
                    <Text data-cms-id="pages.manage.bookingDetails.notes" mode={mode}>
                      <strong>{getCMSField(cmsData, 'pages.manage.bookingDetails.notesLabel', 'Notes:')}</strong> {booking.notes}
                    </Text>
                  )}
                  <Text data-cms-id="pages.manage.bookingDetails.status" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.manage.bookingDetails.statusLabel', 'Status:')}</strong> {booking.status}
                  </Text>
                  <Text data-cms-id="pages.manage.bookingDetails.fare" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.manage.bookingDetails.fareLabel', 'Fare:')}</strong> ${booking.fare}
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
                  data-cms-id="pages.manage.actions.save"
                >
                  {getCMSField(cmsData, 'pages.manage.actions.save', 'Save Changes')}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  data-cms-id="pages.manage.actions.cancel"
                >
                  {getCMSField(cmsData, 'pages.manage.actions.cancel', 'Cancel')}
                </Button>
              </Stack>
            ) : (
              <Stack direction="horizontal" spacing="md" align="center">
                <Button
                  onClick={handleEdit}
                  variant="primary"
                  data-cms-id="pages.manage.actions.edit"
                >
                  {getCMSField(cmsData, 'pages.manage.actions.edit', 'Edit Booking')}
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  data-cms-id="pages.manage.actions.delete"
                >
                  {getCMSField(cmsData, 'pages.manage.actions.delete', 'Delete Booking')}
                </Button>
              </Stack>
            )}
            
            <Button
              onClick={() => router.push('/bookings')}
              variant="outline"
              data-cms-id="pages.manage.actions.backToBookings"
            >
              {getCMSField(cmsData, 'pages.manage.actions.backToBookings', 'Back to Bookings')}
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
