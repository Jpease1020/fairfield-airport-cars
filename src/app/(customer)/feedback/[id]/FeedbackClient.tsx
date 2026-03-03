'use client';

import React, { useState, useEffect } from 'react';
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
} from '@/design/ui';
import { Star } from 'lucide-react';
import { colors } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';

interface FeedbackClientProps {
  bookingId: string;
  cmsData?: any;
}

function FeedbackPageContent({ bookingId, cmsData }: FeedbackClientProps) {
  const pageCmsData = cmsData || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addToast } = useToast();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const response = await authFetch(`/api/booking/${bookingId}`);
        if (!response.ok) {
          throw new Error('Booking not found or invalid');
        }
        const booking = await response.json();
        setRating(booking.rating || 0);
        setComment(booking.comment || '');
      } catch (err) {
        setError(pageCmsData?.['loadFailed'] || 'Failed to load booking details.');
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
      const response = await authFetch('/api/reviews/submit', {
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
        addToast('success', pageCmsData?.['success'] || 'Feedback submitted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || pageCmsData?.['submitFailed'] || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      addToast('error', pageCmsData?.['submitFailed'] || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const homeActions = [
    {
      label: pageCmsData?.['bookAnotherRide'] || 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '📅'
    },
    {
      label: pageCmsData?.['goHome'] || 'Go Home',
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
              <Text align="center" >
                {pageCmsData?.['loading-message'] || 'Please wait while we fetch your booking details...'}
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
              <H1 align="center" >
                {pageCmsData?.['error-title'] || 'Unable to Load Booking'}
              </H1>
              <Text align="center" >
                {pageCmsData?.['error-description'] || 'We could not load your booking details. Please check your booking ID and try again.'}
              </Text>
              <Button
                onClick={() => window.location.href = '/bookings'}
                variant="primary"

                
                text={pageCmsData?.['error-view-bookings'] || 'View My Bookings'}
              />
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
              <H1 align="center" >
                {pageCmsData?.['success-title'] || 'Thank You!'}
              </H1>
              <Text align="center" >
                {pageCmsData?.['success-description'] || 'Your feedback has been submitted successfully. We appreciate your input and will use it to improve our service.'}
              </Text>
              <Stack direction="horizontal" spacing="md" align="center">
                {homeActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant}
                    icon={action.icon}

                    
                    text={action.label}
                  />
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
            <H1 align="center" >
              {pageCmsData?.['title'] || 'Share Your Experience'}
            </H1>
            <Text align="center" >
              {pageCmsData?.['subtitle'] || `We'd love to hear about your ride for booking #${bookingId}`}
            </Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Feedback Form */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <form onSubmit={handleSubmit}>
              <Stack spacing="lg">
                {/* Rating Display */}
                <ContentCard content={
                  <Stack spacing="md">
                    <Text variant="muted" size="sm">
                        {pageCmsData?.['rate-experience-description'] || 'How was your ride?'}
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
                  <Label htmlFor="comment" >
                    {pageCmsData?.['comment-label'] || 'Additional Comments (Optional)'}
                  </Label>
                  <Text >
                    {pageCmsData?.['comment-description'] || 'Tell us more about your experience, any suggestions, or what we did well'}
                  </Text>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                    placeholder={pageCmsData?.['comment-placeholder'] || 'Share your thoughts about your ride experience...'}
                    rows={4}

                  />
                </Stack>

                {/* Submit Button */}
                <Stack spacing="md" align="center">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={rating === 0 || loading}

                  >
                    {loading ? (
                      pageCmsData?.['loading'] || 'Submitting...'
                    ) : (
                      pageCmsData?.['text'] || 'Submit Feedback'
                    )}
                  </Button>
                  <Text size="sm" variant="muted" >
                    {pageCmsData?.['note'] || 'Your feedback helps us improve our service for all customers'}
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
            <Text align="center" >
              {pageCmsData?.['title'] || 'Need help with something else?'}
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

export default function FeedbackClient({ bookingId }: FeedbackClientProps) {
  return (
    <ToastProvider>
      <FeedbackPageContent bookingId={bookingId} />
    </ToastProvider>
  );
}
