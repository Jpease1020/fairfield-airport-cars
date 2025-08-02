'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, Button, LoadingSpinner, EditableText, GridSection, useToast, ToastProvider, Box, Label, Textarea, Stack } from '@/ui';
import { Star } from 'lucide-react';

function FeedbackPageContent() {
  const params = useParams();
  const bookingId = params.id as string;
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
            <EditableText field="feedback.loading.message" defaultValue="Please wait while we fetch your booking details...">
              Please wait while we fetch your booking details...
            </EditableText>
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
            <EditableText field="feedback.error.description" defaultValue="This could be due to an invalid booking ID or a temporary system issue.">
              This could be due to an invalid booking ID or a temporary system issue.
            </EditableText>
            <Stack direction="horizontal" spacing="md">
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                🔄 Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => addToast('info', 'Support: (203) 555-0123')}
              >
                📞 Contact Support
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
              <EditableText field="feedback.success.title" defaultValue="Thank you for your feedback!">
                Thank you for your feedback!
              </EditableText>
            </Text>
            <Text>
              <EditableText field="feedback.success.description" defaultValue="Your feedback helps us improve our service">
                Your feedback helps us improve our service
              </EditableText>
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
            <EditableText field="feedback.title" defaultValue="We'd love to hear about your experience">
              We'd love to hear about your experience
            </EditableText>
          </Text>
          
          <div>
            <Text>
              <EditableText field="feedback.description" defaultValue="Please share your feedback about your recent ride">
                Please share your feedback about your recent ride
              </EditableText>
            </Text>
            
            <form onSubmit={handleSubmit}>
              <div>
                <Label>
                  <EditableText field="feedback.rating.label" defaultValue="Rating">
                    Rating
                  </EditableText>
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
                        fill={star <= rating ? '#FFD700' : 'none'}
                        stroke={star <= rating ? '#FFD700' : '#000'}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>
                  <EditableText field="feedback.comment.label" defaultValue="Comments">
                    Comments
                  </EditableText>
                </Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={4}
                />
              </div>
              
              <Button
                type="submit"
                disabled={rating === 0 || loading}
                variant="primary"
              >
                <EditableText field="feedback.submit.button" defaultValue="Submit Feedback">
                  Submit Feedback
                </EditableText>
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
