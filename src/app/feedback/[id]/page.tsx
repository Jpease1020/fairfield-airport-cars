'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  useToast,
  Form,
  Label,
  Button,
  Textarea
} from '@/components/ui';
import { Star } from 'lucide-react';

function FeedbackPageContent() {
  const params = useParams();
  const { addToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      addToast('error', 'Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: params.id,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        addToast('success', 'Thank you for your feedback!');
      } else {
        addToast('error', 'Failed to submit feedback. Please try again.');
      }
    } catch {
      addToast('error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const homeActions = [
    {
      label: 'Back to Home',
      onClick: () => window.location.href = '/',
      variant: 'primary' as const,
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
            <p>Your rating and comments help us improve our service and provide the best possible experience for all our customers.</p>
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
            <p>
              <Label htmlFor="rating">
                How was your ride?
              </Label>
            </p>
            <p>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="feedback-star-rating-button"
                  variant="ghost"
                  size="sm"
                >
                  <Star />
                </Button>
              ))}
            </p>
            <p>
              {rating === 0 && 'Click a star to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>

            <p>
              <Label htmlFor="comment">
                Additional Comments (Optional)
              </Label>
            </p>
            <p>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                className="feedback-form-textarea"
              />
            </p>

            <p>
              <Button
                type="submit"
                disabled={loading || rating === 0}
                className="feedback-submit-button"
                variant="primary"
                size="lg"
              >
                {loading ? 'Submitting...' : '⭐ Submit Feedback'}
              </Button>
            </p>
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
