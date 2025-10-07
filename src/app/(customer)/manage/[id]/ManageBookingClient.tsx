'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Form,
  Span
} from '@/design/ui';

interface ManageBookingClientProps {
  bookingId: string;
  cmsData?: any;
}   

function ManageBookingPageContent({ bookingId, cmsData }: ManageBookingClientProps) {
  // Temporary: no CMS data for now
  const pageCmsData = cmsData || {};
  
  const router = useRouter();
  const { addToast } = useToast();
  
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
          setError(pageCmsData?.['bookingNotFound'] || 'Booking not found');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(pageCmsData?.['loadFailed'] || 'Failed to load booking');
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
        addToast('success', pageCmsData?.['saveSuccess'] || 'Content saved successfully');
        setEditMode(false);
      } else {
        addToast('error', pageCmsData?.['saveFailed'] || 'Failed to save content');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      addToast('error', pageCmsData?.['saveFailed'] || 'Failed to save content');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setLocalContent(null);
    addToast('info', pageCmsData?.['cancelled'] || 'Changes cancelled');
  };

  const handleEdit = () => {
    setLocalContent(booking);
    setEditMode(true);
  };

  const handleDelete = async () => {
    if (!confirm(pageCmsData?.['delete'] || 'Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast('success', pageCmsData?.['deleteSuccess'] || 'Booking deleted successfully');
        router.push('/bookings');
      } else {
        addToast('error', pageCmsData?.['deleteFailed'] || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      addToast('error', pageCmsData?.['deleteFailed'] || 'Failed to delete booking');
    }
  };

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner />
              <Text align="center" cmsId="loading-message" >
                {pageCmsData?.['message'] || 'Loading booking details...'}
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
              <H1 align="center" cmsId="error-title" >
                  {pageCmsData?.['title'] || 'Unable to Load Booking'}
              </H1>
              <Text align="center" cmsId="error-description" >
                {pageCmsData?.['description'] || 'We could not load the booking details. Please check your booking ID and try again.'}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                cmsId="error-view-bookings"
              >
                {pageCmsData?.['viewBookings'] || 'View My Bookings'}
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
              <H1 align="center" cmsId="no-booking-title" >
                {pageCmsData?.['title'] || 'No Booking Found'}
              </H1>
              <Text align="center" cmsId="no-booking-description" >
                {pageCmsData?.['description'] || 'The booking you are looking for could not be found.'}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                cmsId="view-bookings"
              >
                {pageCmsData?.['view-bookings'] || 'View My Bookings'}
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
            <H1 align="center" cmsId="title" >
              {pageCmsData?.['title'] || 'Manage Booking'}
            </H1>
            <Text align="center" cmsId="subtitle" >
              {pageCmsData?.['subtitle'] || `Manage your booking #${bookingId}`}
            </Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 cmsId="booking-details-title" >
                {pageCmsData?.['title'] || 'Booking Information'}
              </H2>
              
              {editMode ? (
                <Form>
                  <Stack spacing="md">
                    <div>
                      <Label htmlFor="pickupLocation" cmsId="form-pickup-location-label" >
                        {pageCmsData?.['label'] || 'Pickup Location'}
                      </Label>
                      <Input
                        id="pickupLocation"
                        value={localContent?.pickupLocation || ''}
                        onChange={(e) => handleFieldChange('pickupLocation', e.target.value)}
                        placeholder={pageCmsData?.['placeholder'] || 'Enter pickup location'}
                        cmsId="form-pickup-location-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dropoffLocation" cmsId="form-dropoff-location-label" >
                        {pageCmsData?.['label'] || 'Dropoff Location'}
                      </Label>
                      <Input
                        id="dropoffLocation"
                        value={localContent?.dropoffLocation || ''}
                        onChange={(e) => handleFieldChange('dropoffLocation', e.target.value)}
                        placeholder={pageCmsData?.['placeholder'] || 'Enter dropoff location'}
                        cmsId="form-dropoff-location-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pickupDateTime" cmsId="form-pickup-date-time-label" >
                          {pageCmsData?.['label'] || 'Pickup Date & Time'}
                      </Label>
                      <Input
                        id="pickupDateTime"
                        type="datetime-local"
                        value={localContent?.pickupDateTime || ''}
                        onChange={(e) => handleFieldChange('pickupDateTime', e.target.value)}
                        cmsId="form-pickup-date-time-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes" cmsId="form-notes-label" >
                        {pageCmsData?.['label'] || 'Special Notes'}
                      </Label>
                      <Input
                        id="notes"
                        value={localContent?.notes || ''}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        placeholder={pageCmsData?.['placeholder'] || 'Any special requests or notes'}
                        cmsId="form-notes-input"
                      />
                    </div>
                  </Stack>
                </Form>
              ) : (
                <Stack spacing="md">
                  <Text cmsId="booking-details-pickup" >
                    <Span cmsId="pickupLabel" weight="bold">{pageCmsData?.['pickupLabel'] || 'Pickup:'}</Span> {booking.pickupLocation}
                  </Text>
                  <Text cmsId="booking-details-dropoff" >
                    <Span cmsId="dropoffLabel" weight="bold">{pageCmsData?.['dropoffLabel'] || 'Dropoff:'}</Span> {booking.dropoffLocation}
                  </Text>
                  <Text cmsId="booking-details-date-time" >
                    <Span cmsId="dateTimeLabel" weight="bold">{pageCmsData?.['dateTimeLabel'] || 'Date & Time:'}</Span> {new Date(booking.pickupDateTime).toLocaleString()}
                  </Text>

                  {booking.notes && (
                    <Text cmsId="booking-details-notes" >
                      <Span cmsId="notesLabel" weight="bold">{pageCmsData?.['notesLabel'] || 'Notes:'}</Span> {booking.notes}
                    </Text>
                  )}
                  <Text cmsId="booking-details-status" >
                    <Span cmsId="statusLabel" weight="bold">{pageCmsData?.['statusLabel'] || 'Status:'}</Span> {booking.status}
                  </Text>
                  <Text cmsId="booking-details-fare" >
                    <Span cmsId="fareLabel" weight="bold">{pageCmsData?.['fareLabel'] || 'Fare:'}</Span> ${booking.fare}
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
                  cmsId="actions-save"
                >
                  {pageCmsData?.['save'] || 'Save Changes'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  cmsId="actions-cancel"
                >
                  {pageCmsData?.['cancel'] || 'Cancel'}
                </Button>
              </Stack>
            ) : (
              <Stack direction="horizontal" spacing="md" align="center">
                <Button
                  onClick={handleEdit}
                  variant="primary"
                  cmsId="actions-edit"
                >
                  {pageCmsData?.['edit'] || 'Edit Booking'}
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  cmsId="actions-delete"
                >
                  {pageCmsData?.['delete'] || 'Delete Booking'}
                </Button>
              </Stack>
            )}
            
            <Button
              onClick={() => router.push('/bookings')}
              variant="outline"
              cmsId="actions-back-to-bookings"
            >
              {pageCmsData?.['backToBookings'] || 'Back to Bookings'}
            </Button>
          </Stack>
        </Container>
      </GridSection>
    </Container>
  );
}

export default function ManageBookingClient({ bookingId }: ManageBookingClientProps) {
  return (
    <ToastProvider>
      <ManageBookingPageContent bookingId={bookingId} />
    </ToastProvider>
  );
}
