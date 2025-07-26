'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  AdminPageWrapper,
  GridSection, 
  StatCard, 
  InfoCard,
  DataTable,
  DataTableColumn,
  DataTableAction
} from '@/components/ui';

interface Feedback {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
}

function FeedbackPageContent() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('💬 Loading customer feedback...');

      // Mock data - in real implementation, this would fetch from feedback service
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
        },
        {
          id: '5',
          bookingId: 'BK005',
          rating: 5,
          comment: 'Outstanding service from start to finish! Professional driver, luxury vehicle, and excellent customer service.',
          createdAt: new Date('2024-01-11'),
          customerName: 'Robert Brown',
          customerEmail: 'robert@example.com'
        },
        {
          id: '6',
          bookingId: 'BK006',
          rating: 2,
          comment: 'Driver was late and seemed unprepared. Vehicle was okay but service could be much better.',
          createdAt: new Date('2024-01-10'),
          customerName: 'Lisa Davis',
          customerEmail: 'lisa@example.com'
        }
      ];
      
      console.log('✅ Feedback loaded:', mockFeedback.length, 'reviews');
      setFeedback(mockFeedback);
    } catch (err) {
      console.error('❌ Error loading feedback:', err);
      setError('Failed to load customer feedback. Please try again.');
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

    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;
    const fiveStarCount = feedback.filter(f => f.rating === 5).length;
    const positiveCount = feedback.filter(f => f.rating >= 4).length;
    const positivePercentage = (positiveCount / totalFeedback) * 100;

    return {
      totalFeedback,
      averageRating,
      fiveStarCount,
      positivePercentage
    };
  }, [feedback]);

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };



  const renderRating = (rating: number) => {
    return (
      <div className="rating-display">
        <span className="rating-stars">
          {getRatingStars(rating)}
        </span>
        <span className="rating-score">
          {rating}/5
        </span>
      </div>
    );
  };

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: loadFeedback, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Export Report', 
      onClick: () => alert('Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: 'Send Request', 
      href: '/admin/bookings', 
      variant: 'primary' as const 
    }
  ];

  // Table columns
  const columns: DataTableColumn<Feedback>[] = [
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (_, feedback) => (
        <div className="customer-info">
          <div className="customer-name">
            {feedback.customerName}
          </div>
          <div className="customer-contact">
            📧 {feedback.customerEmail}
          </div>
          <div className="customer-booking">
            🎫 {feedback.bookingId}
          </div>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => renderRating(value)
    },
    {
      key: 'comment',
      label: 'Feedback',
      sortable: false,
      render: (value) => (
        <div className="feedback-comment">
          {value}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <div className="feedback-date">
            <div className="date-day">
              {date.toLocaleDateString()}
            </div>
            <div className="date-time">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      }
    }
  ];

  // Table actions
  const actions: DataTableAction<Feedback>[] = [
    {
      label: 'View Details',
      icon: '👁️',
      onClick: (feedback) => alert(`Viewing feedback details for ${feedback.customerName}`),
      variant: 'outline'
    },
    {
      label: 'Reply',
      icon: '💬',
      onClick: (feedback) => alert(`Reply functionality for ${feedback.customerName} coming soon`),
      variant: 'primary'
    },
    {
      label: 'Flag',
      icon: '🚩',
      onClick: (feedback) => alert(`Flag feedback from ${feedback.customerName} coming soon`),
      variant: 'outline',
      condition: (feedback) => feedback.rating <= 2
    }
  ];

  return (
    <AdminPageWrapper
      title="Customer Feedback"
      subtitle="Monitor and manage customer reviews and ratings"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading customer feedback..."
      errorTitle="Feedback Load Error"
    >
      {/* Feedback Statistics */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title="Total Reviews"
          icon="📝"
          statNumber={feedbackStats.totalFeedback.toString()}
          statChange="Customer reviews collected"
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
          statChange={`${((feedbackStats.fiveStarCount / feedbackStats.totalFeedback) * 100).toFixed(0)}% of total`}
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

      {/* Feedback Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="💬 Customer Reviews"
          description="Search, sort, and manage customer feedback and ratings"
        >
          <DataTable
            data={feedback}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by customer name, email, or feedback text..."
            emptyMessage="No customer feedback available yet. Reviews will appear here once customers submit them."
            emptyIcon="⭐"
            pageSize={10}
            rowClassName={(feedback) => 
              feedback.rating <= 2 ? 'border-l-4 border-red-500' : 
              feedback.rating >= 5 ? 'border-l-4 border-green-500' : ''
            }
            onRowClick={(feedback) => console.log('Clicked feedback from:', feedback.customerName)}
          />
        </InfoCard>
      </GridSection>

      {/* Rating Distribution */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📊 Rating Distribution"
          description="Breakdown of customer ratings"
        >
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = feedback.filter(f => f.rating === rating).length;
              const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
              
              return (
                <div key={rating} className="rating-item">
                  <div className="rating-stars-display">
                    {'★'.repeat(rating)}
                  </div>
                  <div className="rating-count">
                    {count}
                  </div>
                  <div className="rating-percentage">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
}

const FeedbackPage = () => {
  return (
    <FeedbackPageContent />
  );
};

export default FeedbackPage;
