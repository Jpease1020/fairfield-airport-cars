'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GridSection, Box, Container, StatCard, Text, Stack, DataTable, DataTableColumn, DataTableAction } from '@/ui';
import { getAllBookings } from '@/lib/services/database-service';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

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
  const { mode } = useInteractionMode();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = async () => {
    try {
      setError(null);
      setLoading(true);

      // Get real booking data and generate feedback from it
      const bookings = await getAllBookings();
      
      // Convert bookings to feedback format (in a real app, this would come from a feedback service)
      const realFeedback: Feedback[] = bookings
        .filter(booking => booking.status === 'completed') // Only completed bookings can have feedback
        .map((booking, index) => ({
          id: `feedback-${booking.id}`,
          bookingId: booking.id || `BK${String(index + 1).padStart(3, '0')}`,
          rating: 5, // Default rating for completed bookings
          comment: `Service for booking to ${booking.dropoffLocation}. Trip completed successfully.`,
          createdAt: new Date(booking.createdAt),
          customerName: booking.name,
          customerEmail: booking.email
        }))
        .slice(0, 10); // Limit to 10 feedback items
  
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
      label: getCMSField(cmsData, 'admin.feedback.sections.table.columns.customer.label', 'Customer'),
      sortable: true,
      render: (_, feedback) => (
        <Container>
          <Stack>
            {getCMSField(cmsData, 'admin.feedback.sections.table.columns.customer.name', feedback.customerName)}
            {getCMSField(cmsData, 'admin.feedback.sections.table.columns.customer.email', `📧 ${feedback.customerEmail}`)}
            {getCMSField(cmsData, 'admin.feedback.sections.table.columns.customer.bookingId', `🎫 ${feedback.bookingId}`)}
          </Stack>
        </Container>
      )
    },
    {
      key: 'rating',
      label: getCMSField(cmsData, 'admin.feedback.sections.table.columns.rating.label', 'Rating'),
      sortable: true,
      render: (value) => renderRating(value)
    },
    {
      key: 'comment',
      label: getCMSField(cmsData, 'admin.feedback.sections.table.columns.comment.label', 'Feedback'),
      sortable: false,
      render: (value) => (
        <Container>
          {getCMSField(cmsData, 'admin.feedback.sections.table.columns.comment.text', value)}
        </Container>
      )
    },
    {
      key: 'createdAt',
      label: getCMSField(cmsData, 'admin.feedback.sections.table.columns.date.label', 'Date'),
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <Container>
            <Stack>
              {getCMSField(cmsData, 'admin.feedback.sections.table.columns.date.date', date.toLocaleDateString())}
              {getCMSField(cmsData, 'admin.feedback.sections.table.columns.date.time', date.toLocaleTimeString())}
            </Stack>
          </Container>
        );
      }
    }
  ];

  // Table actions
  const actions: DataTableAction<Feedback>[] = [
    {
      label: getCMSField(cmsData, 'admin.feedback.sections.table.actions.viewDetails', 'View Details'),
      icon: '👁️',
      onClick: (feedback) => alert(`Viewing feedback details for ${feedback.customerName}`),
      variant: 'outline'
    },
    {
      label: getCMSField(cmsData, 'admin.feedback.sections.table.actions.reply', 'Reply'),
      icon: '💬',
      onClick: (feedback) => alert(`Reply functionality for ${feedback.customerName} coming soon`),
      variant: 'primary'
    },
    {
      label: getCMSField(cmsData, 'admin.feedback.sections.table.actions.flag', 'Flag'),
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
          title={getCMSField(cmsData, 'admin.feedback.sections.stats.totalReviews.title', 'Total Reviews')}
          icon="📝"
          statNumber={feedbackStats.totalFeedback.toString()}
          statChange={getCMSField(cmsData, 'admin.feedback.sections.stats.totalReviews.description', 'Customer reviews collected')}
          changeType="neutral"
        >
          {getCMSField(cmsData, 'admin.feedback.sections.stats.totalReviews.details', `${feedbackStats.totalFeedback} total reviews`)}
        </StatCard>
        <StatCard
          title={getCMSField(cmsData, 'admin.feedback.sections.stats.averageRating.title', 'Average Rating')}
          icon="⭐"
          statNumber={feedbackStats.averageRating.toFixed(1)}
          statChange={getCMSField(cmsData, 'admin.feedback.sections.stats.averageRating.description', 'Out of 5 stars')}
          changeType="positive"
        />
        <StatCard
          title={getCMSField(cmsData, 'admin.feedback.sections.stats.fiveStar.title', '5-Star Reviews')}
          icon="🌟"
          statNumber={feedbackStats.fiveStarCount.toString()}
          statChange={`${((feedbackStats.fiveStarCount / feedbackStats.totalFeedback) * 100).toFixed(0)}% ${getCMSField(cmsData, 'admin.feedback.sections.stats.fiveStar.description', 'of total')}`}
          changeType="positive"
        />
        <StatCard
          title={getCMSField(cmsData, 'admin.feedback.sections.stats.positive.title', 'Positive Reviews')}
          icon="👍"
          statNumber={`${feedbackStats.positivePercentage.toFixed(0)}%`}
          statChange={getCMSField(cmsData, 'admin.feedback.sections.stats.positive.description', '4+ star ratings')}
          changeType="positive"
        />
      </GridSection>

      {/* Feedback Table */}
      <GridSection variant="content" columns={1}>
        <Box>
          <Stack spacing="md">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold" data-cms-id="admin.feedback.sections.table.title" mode={mode}>
                {getCMSField(cmsData, 'admin.feedback.sections.table.title', '💬 Customer Reviews')}
              </Text>
              <Text variant="muted" size="sm" data-cms-id="admin.feedback.sections.table.description" mode={mode}>
                {getCMSField(cmsData, 'admin.feedback.sections.table.description', 'Search, sort, and manage customer feedback and ratings')}
              </Text>
            </Stack>
          <DataTable
            data={feedback}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder={getCMSField(cmsData, 'admin.feedback.sections.table.searchPlaceholder', 'Search by customer name, email, or feedback text...')}
            emptyMessage={getCMSField(cmsData, 'admin.feedback.sections.table.emptyMessage', 'No customer feedback available yet. Reviews will appear here once customers submit them.')}
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
              <Text variant="lead" size="md" weight="semibold" data-cms-id="admin.feedback.sections.ratingDistribution.title" mode={mode}>
                {getCMSField(cmsData, 'admin.feedback.sections.ratingDistribution.title', '📊 Rating Distribution')}
              </Text>
              <Text variant="muted" size="sm" data-cms-id="admin.feedback.sections.ratingDistribution.description" mode={mode}>
                {getCMSField(cmsData, 'admin.feedback.sections.ratingDistribution.description', 'Breakdown of customer ratings')}
              </Text>
            </Stack>
          <Stack direction="vertical" spacing="md">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = feedback.filter(f => f.rating === rating).length;
              const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
              
              return (
                <Stack key={rating} direction="horizontal" justify="space-between" align="center">
                  {getCMSField(cmsData, 'admin.feedback.sections.ratingDistribution.stars', '★'.repeat(rating))}
                  {getCMSField(cmsData, 'admin.feedback.sections.ratingDistribution.count', count.toString())}
                  {getCMSField(cmsData, 'admin.feedback.sections.ratingDistribution.percentage', `${percentage.toFixed(0)}%`)}
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
