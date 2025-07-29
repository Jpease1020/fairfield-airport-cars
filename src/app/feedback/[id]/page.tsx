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
  Text,
  EditableText
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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
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
      icon: '📅'
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
        layoutType="content"
        title="🎉 Thank You!"
        subtitle="Your feedback has been submitted successfully"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="✅ Feedback Submitted"
            description="We appreciate you taking the time to share your experience"
          >
            <EditableText field="feedback.description" defaultValue="Your rating and comments help us improve our service and provide the best possible experience for all our customers.">
              Your rating and comments help us improve our service and provide the best possible experience for all our customers.
            </EditableText>
            <ActionButtonGroup buttons={homeActions} />
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout 
      layoutType="content"
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
                <EditableText field="feedback.ratingLabel" defaultValue="How was your ride?">
                  How was your ride?
                </EditableText>
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
              {rating === 0 && (
                <EditableText field="feedback.clickStarToRate" defaultValue="Click a star to rate">
                  Click a star to rate
                </EditableText>
              )}
              {rating === 1 && (
                <EditableText field="feedback.ratingPoor" defaultValue="Poor">
                  Poor
                </EditableText>
              )}
              {rating === 2 && (
                <EditableText field="feedback.ratingFair" defaultValue="Fair">
                  Fair
                </EditableText>
              )}
              {rating === 3 && (
                <EditableText field="feedback.ratingGood" defaultValue="Good">
                  Good
                </EditableText>
              )}
              {rating === 4 && (
                <EditableText field="feedback.ratingVeryGood" defaultValue="Very Good">
                  Very Good
                </EditableText>
              )}
              {rating === 5 && (
                <EditableText field="feedback.ratingExcellent" defaultValue="Excellent">
                  Excellent
                </EditableText>
              )}
            </Text>

            <Text>
              <Label htmlFor="comment">
                <EditableText field="feedback.commentsLabel" defaultValue="Additional Comments (Optional)">
                  Additional Comments (Optional)
                </EditableText>
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
                {loading ? (
                  <EditableText field="feedback.submitting" defaultValue="Submitting...">
                    Submitting...
                  </EditableText>
                ) : (
                  <EditableText field="feedback.submitFeedback" defaultValue="⭐ Submit Feedback">
                    ⭐ Submit Feedback
                  </EditableText>
                )}
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
