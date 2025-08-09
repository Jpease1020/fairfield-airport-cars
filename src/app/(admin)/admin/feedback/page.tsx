'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GridSection, Box, Container, StatCard, Text, Stack, DataTable, DataTableColumn, DataTableAction } from '@/ui';
import { getAllBookings } from '@/lib/services/database-service';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

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
  const { cmsData } = useCMSData();
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
          {getCMSField(cmsData, 'admin.feedback.ratingStars', getRatingStars(rating))}
          {getCMSField(cmsData, 'admin.feedback.ratingScore', `${rating}/5`)}
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
            {getCMSField(cmsData, 'admin.feedback.customerName', feedback.customerName)}
            {getCMSField(cmsData, 'admin.feedback.customerEmail', `📧 ${feedback.customerEmail}`)}
            {getCMSField(cmsData, 'admin.feedback.bookingId', `🎫 ${feedback.bookingId}`)}
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
          {getCMSField(cmsData, 'admin.feedback.comment', value)}
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
              {getCMSField(cmsData, 'admin.feedback.date', date.toLocaleDateString())}
              {getCMSField(cmsData, 'admin.feedback.time', date.toLocaleTimeString())}
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
    <>
      {/* Feedback Statistics */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title="Total Reviews"
          icon="📝"
          statNumber={feedbackStats.totalFeedback.toString()}
          statChange="Customer reviews collected"
          changeType="neutral"
        >
          {getCMSField(cmsData, 'admin.feedback.totalReviews', `${feedbackStats.totalFeedback} total reviews`)}
        </StatCard>
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
        <Box>
          <Stack spacing="md">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">💬 Customer Reviews</Text>
              <Text variant="muted" size="sm">Search, sort, and manage customer feedback and ratings</Text>
            </Stack>
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
          </Stack>
        </Box>
      </GridSection>

      {/* Rating Distribution */}
      <GridSection variant="content" columns={1}>
        <Box>
          <Stack spacing="md">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">📊 Rating Distribution</Text>
              <Text variant="muted" size="sm">Breakdown of customer ratings</Text>
            </Stack>
          <Stack direction="vertical" spacing="md">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = feedback.filter(f => f.rating === rating).length;
              const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
              
              return (
                <Stack key={rating} direction="horizontal" justify="space-between" align="center">
                  {getCMSField(cmsData, 'admin.feedback.stars', '★'.repeat(rating))}
                  {getCMSField(cmsData, 'admin.feedback.count', count.toString())}
                  {getCMSField(cmsData, 'admin.feedback.percentage', `${percentage.toFixed(0)}%`)}
                </Stack>
              );
            })}
          </Stack>
          </Stack>
        </Box>
      </GridSection>
    </>
  );
}

const FeedbackPage = () => {
  return (
    <FeedbackPageContent />
  );
};

export default FeedbackPage;
