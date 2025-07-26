'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { UnifiedLayout } from '@/lib/design-system/UnifiedLayout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  useToast
} from '@/components/ui';
import { Star } from 'lucide-react';


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
    return (<UnifiedLayout 
      layoutType="standard"
      title="Share Feedback"
      subtitle="Tell us about your experience"
    >
      <UniversalLayout 
          layoutType="standard"
          title="🎉 Thank You!"
          subtitle="Your feedback has been submitted successfully"
        >
          <GridSection variant="content" columns={1}>
            <InfoCard
              title="✅ Feedback Submitted"
              description="We appreciate you taking the time to share your experience"
            >
              <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-xl)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>⭐</div>
                <h3 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--text-primary)' }}>
                  Thank you for your feedback!
                </h3>
                <p style={{ 
                  margin: '0 0 var(--spacing-lg) 0', 
                  color: 'var(--text-secondary)',
                  maxWidth: '500px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  Your rating and comments help us improve our service and provide the best 
                  possible experience for all our customers.
                </p>
                
                <ActionButtonGroup buttons={homeActions} />
              </div>
            </InfoCard>
          </GridSection>
    </UnifiedLayout>
      </LayoutEnforcer>
    );
  }

  return (<UnifiedLayout 
      layoutType="standard"
      title="Share Feedback"
      subtitle="Tell us about your experience"
    >
      <UniversalLayout 
        layoutType="standard"
        title="Leave Feedback"
        subtitle="Help us improve by sharing your experience"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="⭐ Rate Your Experience"
            description="How was your ride with Fairfield Airport Cars?"
          >
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg) 0'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  How was your ride?
                </label>
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-sm)',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--border-radius)',
                        border: 'none',
                        backgroundColor: star <= rating ? 'var(--yellow-50)' : 'transparent',
                        color: star <= rating ? 'var(--yellow-500)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (star > rating) {
                          e.currentTarget.style.color = 'var(--yellow-400)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (star > rating) {
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }
                      }}
                    >
                      <Star style={{ width: '2rem', height: '2rem' }} />
                    </button>
                  ))}
                </div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  {rating === 0 && 'Click a star to rate'}
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              <div>
                <label 
                  htmlFor="comment" 
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--spacing-sm)'
                  }}
                >
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={4}
                  className="form-input"
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || rating === 0}
                className=""
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ animation: 'spin 1s linear infinite', marginRight: 'var(--spacing-sm)', width: '1.25rem', height: '1.25rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  '⭐ Submit Feedback'
                )}
              </button>
            </form>
          </InfoCard>
        </GridSection>
    </UnifiedLayout>
    </LayoutEnforcer>
  );
}

export default function FeedbackPage() {
  return (
    <ToastProvider>
      <FeedbackPageContent />
    </ToastProvider>
  );
