'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  Form,
  Label,
  Textarea,
  Button,
  ToastProvider,
  Text
} from '@/components/ui';
import { Star } from 'lucide-react';

function FeedbackPageContent() {
  const params = useParams();
  const bookingId = params.id as string;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
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
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const homeActions = [
    {
      label: 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '🚗'
    },
    {
      label: 'Go Home',
      onClick: () => window.location.href = '/',
      variant: 'secondary' as const,
      icon: '🏠'
    }
  ];

  if (submitted) {
    return (
      <UnifiedLayout 
        layoutType="standard"
        title="🎉 Thank You!"
        subtitle="Your feedback has been submitted successfully"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="✅ Feedback Submitted"
            description="We appreciate you taking the time to share your experience"
          >
            <Text>Your rating and comments help us improve our service and provide the best possible experience for all our customers.</Text>
            <ActionButtonGroup buttons={homeActions} />
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout 
      layoutType="standard"
      title="Leave Feedback"
      subtitle="Help us improve by sharing your experience"
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="⭐ Rate Your Experience"
          description="How was your ride with Fairfield Airport Cars?"
        >
          <Form onSubmit={handleSubmit}>
            <Text>
              <Label htmlFor="rating">
                How was your ride?
              </Label>
            </Text>
            <Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  variant="ghost"
                  size="sm"
                >
                  <Star />
                </Button>
              ))}
            </Text>
            <Text>
              {rating === 0 && 'Click a star to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>

            <Text>
              <Label htmlFor="comment">
                Additional Comments (Optional)
              </Label>
            </Text>
            <Text>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
              />
            </Text>

            <Text>
              <Button
                type="submit"
                disabled={loading || rating === 0}
                variant="primary"
                size="lg"
              >
                {loading ? 'Submitting...' : '⭐ Submit Feedback'}
              </Button>
            </Text>
          </Form>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function FeedbackPage() {
  return (
    <ToastProvider>
      <FeedbackPageContent />
    </ToastProvider>
  );
}
