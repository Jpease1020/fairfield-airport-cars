'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, Button, LoadingSpinner, GridSection, useToast, ToastProvider, Box, Label, Textarea, Stack } from '@/ui';
import { Star } from 'lucide-react';
import { colors } from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function FeedbackPageContent() {
  const params = useParams();
  const bookingId = params.id as string;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cmsData } = useCMSData();
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
        setError('Failed to load booking details.');
        console.error('Error fetching booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

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
        addToast('success', 'Feedback submitted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      addToast('error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const homeActions = [
    {
      label: 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '📅'
    },
    {
      label: 'Go Home',
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
            <LoadingSpinner />
            {getCMSField(cmsData, 'feedback.loading.message', 'Please wait while we fetch your booking details...')}
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
            {getCMSField(cmsData, 'feedback.error.description', 'This could be due to an invalid booking ID or a temporary system issue.')}
            <Stack direction="horizontal" spacing="md">
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                {getCMSField(cmsData, 'feedback.actions.try_again', '🔄 Try Again')}
              </Button>
              <Button
                variant="outline"
                onClick={() => addToast('info', 'Support: (203) 555-0123')}
              >
                {getCMSField(cmsData, 'feedback.actions.contact_support', '📞 Contact Support')}
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
          <Box variant="elevated" padding="lg">
            <Text>
              {getCMSField(cmsData, 'feedback.success.title', 'Thank you for your feedback!')}
            </Text>
            <Text>
              {getCMSField(cmsData, 'feedback.success.description', 'Your feedback helps us improve our service')}
            </Text>
            <Stack direction="horizontal" spacing="md">
              {homeActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                >
                  {action.icon} {action.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </GridSection>
      </Container>
    );
  }

  return (
    <Container variant="default" padding="none">
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Text>
            {getCMSField(cmsData, 'feedback.title', "We'd love to hear about your experience")}
          </Text>
          
          <div>
            <Text>
              {getCMSField(cmsData, 'feedback.description', 'Please share your feedback about your recent ride')}
            </Text>
            
            <form onSubmit={handleSubmit}>
              <div>
                <Label>
                  {getCMSField(cmsData, 'feedback.rating.label', 'Rating')}
                </Label>
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      variant="ghost"
                      onClick={() => setRating(star)}
                    >
                      <Star
                        size={24}
                        fill={star <= rating ? colors.warning[500] : 'none'}
                        stroke={star <= rating ? colors.warning[500] : colors.text.primary}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>
                  {getCMSField(cmsData, 'feedback.comment.label', 'Comments')}
                </Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={getCMSField(cmsData, 'feedback.comment.placeholder', 'Tell us about your experience...')}
                  rows={4}
                />
              </div>
              
              <Button
                type="submit"
                disabled={rating === 0 || loading}
                variant="primary"
              >
                {getCMSField(cmsData, 'feedback.submit.button', 'Submit Feedback')}
              </Button>
            </form>
          </div>
        </Box>
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
