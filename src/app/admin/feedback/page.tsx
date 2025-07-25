'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  PageHeader, 
  GridSection, 
  StatCard, 
  InfoCard
} from '@/components/ui';
import { EmptyState } from '@/components/data';

interface Feedback {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
}

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = async () => {
    try {
      // For now, we'll use mock data since the feedback service is for page comments
      // In a real implementation, this would fetch actual customer feedback
      const mockFeedback: Feedback[] = [
        {
          id: '1',
          bookingId: 'BK001',
          rating: 5,
          comment: 'Excellent service! Driver was on time and very professional. The vehicle was clean and comfortable. Will definitely book again!',
          createdAt: new Date('2024-01-15'),
          customerName: 'John Smith',
          customerEmail: 'john@example.com'
        },
        {
          id: '2',
          bookingId: 'BK002',
          rating: 4,
          comment: 'Good service overall. Clean vehicle and safe driving. Driver was friendly and knew the route well.',
          createdAt: new Date('2024-01-14'),
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com'
        },
        {
          id: '3',
          bookingId: 'BK003',
          rating: 5,
          comment: 'Amazing experience! The driver arrived early and helped with luggage. Great communication throughout the trip.',
          createdAt: new Date('2024-01-13'),
          customerName: 'Mike Johnson',
          customerEmail: 'mike@example.com'
        },
        {
          id: '4',
          bookingId: 'BK004',
          rating: 3,
          comment: 'Service was okay. Driver was on time but vehicle could have been cleaner.',
          createdAt: new Date('2024-01-12'),
          customerName: 'Sarah Wilson',
          customerEmail: 'sarah@example.com'
        }
      ];
      setFeedback(mockFeedback);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  // Calculate feedback metrics
  const feedbackStats = useMemo(() => {
    if (feedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        fiveStarCount: 0,
        positivePercentage: 0
      };
    }

    const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / feedback.length;
    const fiveStarCount = feedback.filter(item => item.rating === 5).length;
    const positiveCount = feedback.filter(item => item.rating >= 4).length;
    const positivePercentage = (positiveCount / feedback.length) * 100;

    return {
      totalFeedback: feedback.length,
      averageRating,
      fiveStarCount,
      positivePercentage
    };
  }, [feedback]);

  const headerActions = [
    { 
      label: 'Export Feedback', 
      onClick: () => alert('Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: 'Send Feedback Request', 
      href: '/admin/bookings', 
      variant: 'primary' as const 
    }
  ];

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 5) return 'text-green-600';
    if (rating >= 4) return 'text-yellow-600';
    if (rating >= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <PageHeader
          title="Customer Feedback"
          subtitle="Loading feedback..."
        />
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Customer Feedback"
        subtitle="Reviews and ratings from your customers"
        actions={headerActions}
      />

      <GridSection variant="stats" columns={4}>
        <StatCard
          title="Total Reviews"
          icon="📝"
          statNumber={feedbackStats.totalFeedback.toString()}
          statChange="Customer reviews"
          changeType="neutral"
        />
        <StatCard
          title="Average Rating"
          icon="⭐"
          statNumber={feedbackStats.averageRating.toFixed(1)}
          statChange="Out of 5 stars"
          changeType="positive"
        />
        <StatCard
          title="5-Star Reviews"
          icon="🌟"
          statNumber={feedbackStats.fiveStarCount.toString()}
          statChange="Excellent ratings"
          changeType="positive"
        />
        <StatCard
          title="Positive Reviews"
          icon="👍"
          statNumber={`${feedbackStats.positivePercentage.toFixed(0)}%`}
          statChange="4+ star ratings"
          changeType="positive"
        />
      </GridSection>

      <GridSection variant="content" columns={1}>
        <InfoCard
          title="Customer Reviews"
          description={`Showing ${feedback.length} reviews from customers`}
        >
          {feedback.length === 0 ? (
            <EmptyState
              icon="⭐"
              title="No feedback found"
              description="Customer reviews will appear here once submitted"
            />
          ) : (
            <div className="feedback-list space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="feedback-item border-b pb-4 last:border-b-0">
                  <div className="feedback-header flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{item.customerName}</h3>
                      <div className="text-sm text-gray-600">
                        <p>{item.createdAt.toLocaleDateString()} at {item.createdAt.toLocaleTimeString()}</p>
                        <p>Booking ID: {item.bookingId}</p>
                      </div>
                    </div>
                    <div className="rating-display text-right">
                      <div className={`rating-stars text-xl ${getRatingColor(item.rating)}`}>
                        {getRatingStars(item.rating)}
                      </div>
                      <p className="rating-score text-sm font-medium">{item.rating}/5</p>
                    </div>
                  </div>
                  <div className="comment-content mb-3">
                    <p className="text-gray-800">{item.comment}</p>
                  </div>
                  <div className="contact-info">
                    <p className="text-sm text-gray-600">
                      Contact: {item.customerEmail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </GridSection>
    </div>
  );
};

export default FeedbackPage; 