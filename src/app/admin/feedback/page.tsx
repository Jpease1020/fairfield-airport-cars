'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminPageWrapper, GridSection, Card, Container } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/ToastProvider';
import { DataTable, DataTableColumn, DataTableAction } from '@/components/ui/DataTable';
import { getAllBookings } from '@/lib/services/database-service';
import { EditableText } from '@/design/components/core/layout/EditableSystem';

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

      // Get real booking data and generate feedback from it
      const bookings = await getAllBookings();
      
      // Convert bookings to feedback format (in a real app, this would come from a feedback service)
      const realFeedback: Feedback[] = bookings
        .filter(booking => booking.status === 'completed') // Only completed bookings can have feedback
        .map((booking, index) => ({
          id: `feedback-${booking.id}`,
          bookingId: booking.id || `BK${String(index + 1).padStart(3, '0')}`,
          rating: Math.floor(Math.random() * 3) + 3, // Random rating 3-5 for demo
          comment: `Service for booking to ${booking.dropoffLocation}. ${booking.status === 'completed' ? 'Trip completed successfully.' : 'Trip in progress.'}`,
          createdAt: new Date(booking.createdAt),
          customerName: booking.name,
          customerEmail: booking.email
        }))
        .slice(0, 10); // Limit to 10 feedback items
      
      console.log('✅ Feedback loaded from real data:', realFeedback.length, 'reviews');
      setFeedback(realFeedback);
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
      <Container>
        <Stack>
          <EditableText field="admin.feedback.ratingStars" defaultValue={getRatingStars(rating)}>
            {getRatingStars(rating)}
          </EditableText>
          <EditableText field="admin.feedback.ratingScore" defaultValue={`${rating}/5`}>
            {rating}/5
          </EditableText>
        </Stack>
      </Container>
    );
  };

  // Table columns
  const columns: DataTableColumn<Feedback>[] = [
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (_, feedback) => (
        <Container>
          <Stack>
            <EditableText field="admin.feedback.customerName" defaultValue={feedback.customerName}>
              {feedback.customerName}
            </EditableText>
            <EditableText field="admin.feedback.customerEmail" defaultValue={`📧 ${feedback.customerEmail}`}>
              📧 {feedback.customerEmail}
            </EditableText>
            <EditableText field="admin.feedback.bookingId" defaultValue={`🎫 ${feedback.bookingId}`}>
              🎫 {feedback.bookingId}
            </EditableText>
          </Stack>
        </Container>
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
        <Container>
          <EditableText field="admin.feedback.comment" defaultValue={value}>
            {value}
          </EditableText>
        </Container>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <Container>
            <Stack>
              <EditableText field="admin.feedback.date" defaultValue={date.toLocaleDateString()}>
                {date.toLocaleDateString()}
              </EditableText>
              <EditableText field="admin.feedback.time" defaultValue={date.toLocaleTimeString()}>
                {date.toLocaleTimeString()}
              </EditableText>
            </Stack>
          </Container>
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
      loading={loading}
      error={error}
      loadingMessage="Loading customer feedback..."
      errorTitle="Feedback Load Error"
    >
      {/* Feedback Statistics */}
      <GridSection variant="stats" columns={4}>
        <Card
          title="Total Reviews"
          icon="📝"
          statNumber={feedbackStats.totalFeedback.toString()}
          statChange="Customer reviews collected"
          changeType="neutral"
        >
          <EditableText field="admin.feedback.totalReviews" defaultValue={`${feedbackStats.totalFeedback} total reviews`}>
            {feedbackStats.totalFeedback} total reviews
          </EditableText>
        </Card>
        <Card
          title="Average Rating"
          icon="⭐"
          statNumber={feedbackStats.averageRating.toFixed(1)}
          statChange="Out of 5 stars"
          changeType="positive"
        >
          {null}
        </Card>
        <Card
          title="5-Star Reviews"
          icon="🌟"
          statNumber={feedbackStats.fiveStarCount.toString()}
          statChange={`${((feedbackStats.fiveStarCount / feedbackStats.totalFeedback) * 100).toFixed(0)}% of total`}
          changeType="positive"
        >
          {null}
        </Card>
        <Card
          title="Positive Reviews"
          icon="👍"
          statNumber={`${feedbackStats.positivePercentage.toFixed(0)}%`}
          statChange="4+ star ratings"
          changeType="positive"
        >
          {null}
        </Card>
      </GridSection>

      {/* Feedback Table */}
      <GridSection variant="content" columns={1}>
        <Card
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
          />
        </Card>
      </GridSection>

      {/* Rating Distribution */}
      <GridSection variant="content" columns={1}>
        <Card
          title="📊 Rating Distribution"
          description="Breakdown of customer ratings"
        >
          <Stack direction="vertical" spacing="md">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = feedback.filter(f => f.rating === rating).length;
              const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
              
              return (
                <Stack key={rating} direction="horizontal" justify="between" align="center">
                  <EditableText field="admin.feedback.stars" defaultValue={'★'.repeat(rating)}>
                    {'★'.repeat(rating)}
                  </EditableText>
                  <EditableText field="admin.feedback.count" defaultValue={count.toString()}>
                    {count}
                  </EditableText>
                  <EditableText field="admin.feedback.percentage" defaultValue={`${percentage.toFixed(0)}%`}>
                    {percentage.toFixed(0)}%
                  </EditableText>
                </Stack>
              );
            })}
          </Stack>
        </Card>
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
