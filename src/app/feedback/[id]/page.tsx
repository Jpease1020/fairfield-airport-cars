'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { createFeedback } from '@/lib/feedback-service';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { StarRating } from '@/components/feedback';
import { Alert } from '@/components/feedback';
import { FormSection } from '@/components/forms';
import { Card, CardContent } from '@/components/ui/card';

export default function FeedbackPage() {
  const params = useParams();
  const { id: bookingId } = params;
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError(null);

    try {
      await createFeedback({
        bookingId: bookingId as string,
        rating,
        comments,
      });
      setSubmitted(true);
    } catch {
      setError('Sorry, there was an issue submitting your feedback. Please try again later.');
    }
  };

  if (submitted) {
    return (
      <PageContainer maxWidth="md" padding="lg">
        <div className="text-center">
          <Alert variant="success" title="Thank You!">
            Your feedback is greatly appreciated and helps us improve our service.
          </Alert>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md" padding="lg">
      <PageHeader title="Leave Feedback" />
      <PageContent>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <FormSection title="Rate Your Experience" description="How was your ride?">
                <div className="flex justify-center">
                  <StarRating
                    rating={rating}
                    onRatingChange={handleRating}
                    interactive={true}
                    size="lg"
                  />
                </div>
              </FormSection>

              <FormSection title="Additional Comments">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </FormSection>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={rating === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
            
            {error && (
              <Alert variant="error" title="Error">
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
