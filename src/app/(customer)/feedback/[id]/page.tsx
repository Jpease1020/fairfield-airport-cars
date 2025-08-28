'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Container,
  Stack,
  Text,
  Button,
  LoadingSpinner,
  H1,
  ContentCard,
  GridSection,
  useToast,
  ToastProvider,
  Label,
  Textarea,
  Box
} from '@/ui';
import { Star } from 'lucide-react';
import { colors } from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function FeedbackPageContent() {
  const params = useParams();
  const bookingId = params.id as string;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Booking not found or invalid');
        }
        const booking = await response.json();
        setRating(booking.rating || 0);
        setComment(booking.comment || '');
      } catch (err) {
        setError(getCMSField(cmsData, 'loadFailed', 'Failed to load booking details.'));
        console.error('Error fetching booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, cmsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        addToast('success', getCMSField(cmsData, 'success', 'Feedback submitted successfully!'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || getCMSField(cmsData, 'submitFailed', 'Failed to submit feedback'));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      addToast('error', getCMSField(cmsData, 'submitFailed', 'Failed to submit feedback. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const homeActions = [
    {
      label: getCMSField(cmsData, 'bookAnotherRide', 'Book Another Ride'),
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '📅'
    },
    {
      label: getCMSField(cmsData, 'goHome', 'Go Home'),
      onClick: () => window.location.href = '/',
      variant: 'secondary' as const,
      icon: '🏠'
    }
  ];

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner />
              <Text align="center" data-cms-id="loading-message" mode={mode}>
                {getCMSField(cmsData, 'loading-message', 'Please wait while we fetch your booking details...')}
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
                {getCMSField(cmsData, 'error-title', 'Unable to Load Booking')}
              </H1>
              <Text align="center" data-cms-id="error-description" mode={mode}>
                {getCMSField(cmsData, 'error-description', 'We could not load your booking details. Please check your booking ID and try again.')}
              </Text>
              <Button
                onClick={() => window.location.href = '/bookings'}
                variant="primary"
                data-cms-id="error-view-bookings"
              >
                {getCMSField(cmsData, 'error-view-bookings', 'View My Bookings')}
              </Button>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <H1 align="center" data-cms-id="success-title" mode={mode}>
                {getCMSField(cmsData, 'success-title', 'Thank You!')}
              </H1>
              <Text align="center" data-cms-id="success-description" mode={mode}>
                {getCMSField(cmsData, 'success-description', 'Your feedback has been submitted successfully. We appreciate your input and will use it to improve our service.')}
              </Text>
              <Stack direction="horizontal" spacing="md" align="center">
                {homeActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant}
                    icon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
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
              {getCMSField(cmsData, 'title', 'Share Your Experience')}
            </H1>
            <Text align="center" data-cms-id="subtitle" mode={mode}>
              {getCMSField(cmsData, 'subtitle', `We'd love to hear about your ride for booking #${bookingId}`)}
            </Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Feedback Form */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <form onSubmit={handleSubmit} data-cms-id="rate-experience-description">
              <Stack spacing="lg">
                {/* Rating Display */}
                <ContentCard content={
                  <Stack spacing="md">
                    <Text variant="muted" size="sm">
                      {getCMSField(cmsData, 'rate-experience-description', 'How was your ride?')}
                    </Text>
                    <Stack direction="horizontal" spacing="sm" align="center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="sm"
                          onClick={() => setRating(star)}
                        >
                          <Star size={24} fill={rating >= star ? colors.primary[500] : 'transparent'} />
                        </Button>
                      ))}
                    </Stack>
                    <Text variant="muted" size="sm">
                      {rating > 0 ? `${rating} ${rating === 1 ? 'star' : 'stars'}` : 'Select rating'}
                    </Text>
                  </Stack>
                } />

                {/* Comment Section */}
                <Stack spacing="md">
                  <Label htmlFor="comment" data-cms-id="comment-label" mode={mode}>
                    {getCMSField(cmsData, 'comment-label', 'Additional Comments (Optional)')}
                  </Label>
                  <Text data-cms-id="comment-description" mode={mode}>
                    {getCMSField(cmsData, 'comment-description', 'Tell us more about your experience, any suggestions, or what we did well')}
                  </Text>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                    placeholder={getCMSField(cmsData, 'comment-placeholder', 'Share your thoughts about your ride experience...')}
                    rows={4}
                    data-cms-id="comment-input"
                  />
                </Stack>

                {/* Submit Button */}
                <Stack spacing="md" align="center">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={rating === 0 || loading}
                    data-cms-id="submit-button"
                  >
                    {loading ? (
                      getCMSField(cmsData, 'loading', 'Submitting...')
                    ) : (
                      getCMSField(cmsData, 'text', 'Submit Feedback')
                    )}
                  </Button>
                  <Text size="sm" variant="muted" data-cms-id="submit-note" mode={mode}>
                    {getCMSField(cmsData, 'note', 'Your feedback helps us improve our service for all customers')}
                  </Text>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Container>
      </GridSection>

      {/* Alternative Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md" align="center">
            <Text align="center" data-cms-id="alternatives-title" mode={mode}>
              {getCMSField(cmsData, 'title', 'Need help with something else?')}
            </Text>
            <Stack direction="horizontal" spacing="md" align="center">
              {homeActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant}
                  icon={action.icon}
                  data-cms-id={`pages.feedback.alternatives.actions.${index}`}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </GridSection>
    </Container>
  );
}

export default function FeedbackPage() {
  return (
    <ToastProvider>
      <FeedbackPageContent />
    </ToastProvider>
  );
}
