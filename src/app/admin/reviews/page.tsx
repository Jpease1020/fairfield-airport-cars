'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Box, 
  Grid, 
  GridItem,
  Badge,
  Button,
  LoadingSpinner,
  useToast,
  DataTable,
  ToastProvider
} from '@/ui';
import { Star, MessageCircle, ExternalLink } from 'lucide-react';
import { reviewAggregationService } from '@/lib/services/review-aggregation-service';

function ReviewManagementPageContent() {
  const [aggregation, setAggregation] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const [aggregationData, recentReviews] = await Promise.all([
          reviewAggregationService.getAggregatedReviews(),
          reviewAggregationService.getRecentReviews(50)
        ]);
        
        setAggregation(aggregationData);
        setReviews(recentReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        addToast('error', 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [addToast]);

  const renderStars = (rating: number) => {
    return (
      <Stack direction="horizontal" spacing="xs">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? 'var(--color-yellow-500)' : 'var(--color-gray-300)'}
            color={star <= rating ? 'var(--color-yellow-500)' : 'var(--color-gray-300)'}
          />
        ))}
      </Stack>
    );
  };

  const getPlatformLink = (review: any) => {
    switch (review.source) {
      case 'google':
        return `https://www.google.com/maps/place/?q=place_id:${process.env.GOOGLE_PLACE_ID}`;
      case 'yelp':
        return `https://www.yelp.com/biz/${process.env.YELP_BUSINESS_ID}`;
      default:
        return null;
    }
  };

  const filteredReviews = selectedPlatform === 'all' 
    ? reviews 
    : reviews.filter(review => review.source === selectedPlatform);

  const reviewColumns = [
    {
      key: 'platform',
      label: 'Platform',
      render: (review: any) => (
        <Stack direction="horizontal" align="center" spacing="sm">
          <Badge variant="default" size="sm">
            {review.platformIcon} {review.platform}
          </Badge>
        </Stack>
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (review: any) => (
        <Stack direction="horizontal" align="center" spacing="sm">
          {renderStars(review.rating)}
          <Text weight="bold">{review.rating}/5</Text>
        </Stack>
      )
    },
    {
      key: 'reviewer',
      label: 'Reviewer',
      render: (review: any) => (
        <Text weight="bold">{review.reviewerName}</Text>
      )
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (review: any) => (
        <Text size="sm">
          {review.comment.length > 100 
            ? `${review.comment.substring(0, 100)}...` 
            : review.comment
          }
        </Text>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (review: any) => (
        <Text size="sm" variant="muted">
          {new Date(review.reviewTime).toLocaleDateString()}
        </Text>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (review: any) => {
        const platformLink = getPlatformLink(review);
        return (
          <Stack direction="horizontal" spacing="sm">
            {platformLink && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(platformLink, '_blank')}
              >
                <ExternalLink size={14} />
                Respond
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToast('info', 'Review response feature coming soon')}
            >
              <MessageCircle size={14} />
              Internal Note
            </Button>
          </Stack>
        );
      }
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" padding="xl">
        <Stack align="center" spacing="md">
          <LoadingSpinner size="lg" />
          <Text>Loading review management dashboard...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" padding="xl">
      <Stack spacing="xl">
        <Stack spacing="md">
          <Text size="xl" weight="bold">Review Management</Text>
          <Text variant="muted">Manage and respond to reviews across all platforms</Text>
        </Stack>

        {/* Review Summary */}
        {aggregation && (
          <Grid cols={4} gap="lg">
            <GridItem>
              <Box variant="elevated" padding="md">
                <Stack align="center" spacing="sm">
                  <Text size="xl" weight="bold">
                    {aggregation.averageRating.toFixed(1)}
                  </Text>
                  <Text size="sm" variant="muted">Average Rating</Text>
                  {renderStars(Math.round(aggregation.averageRating))}
                </Stack>
              </Box>
            </GridItem>
            
            <GridItem>
              <Box variant="elevated" padding="md">
                <Stack align="center" spacing="sm">
                  <Text size="xl" weight="bold">
                    {aggregation.totalReviews}
                  </Text>
                  <Text size="sm" variant="muted">Total Reviews</Text>
                </Stack>
              </Box>
            </GridItem>
            
            <GridItem>
              <Box variant="elevated" padding="md">
                <Stack align="center" spacing="sm">
                  <Text size="xl" weight="bold">
                    {aggregation.reviewBreakdown.google.count + aggregation.reviewBreakdown.yelp.count}
                  </Text>
                  <Text size="sm" variant="muted">External Reviews</Text>
                </Stack>
              </Box>
            </GridItem>
            
            <GridItem>
              <Box variant="elevated" padding="md">
                <Stack align="center" spacing="sm">
                  <Text size="xl" weight="bold">
                    {aggregation.reviewBreakdown.internal.count}
                  </Text>
                  <Text size="sm" variant="muted">Internal Reviews</Text>
                </Stack>
              </Box>
            </GridItem>
          </Grid>
        )}

        {/* Platform Filter */}
        <Box variant="outlined" padding="md">
          <Stack spacing="md">
            <Text weight="bold">Filter by Platform</Text>
            <Stack direction="horizontal" spacing="sm">
              <Button
                variant={selectedPlatform === 'all' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlatform('all')}
              >
                All Platforms ({reviews.length})
              </Button>
              <Button
                variant={selectedPlatform === 'google' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlatform('google')}
              >
                🔍 Google ({reviews.filter(r => r.source === 'google').length})
              </Button>
              <Button
                variant={selectedPlatform === 'yelp' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlatform('yelp')}
              >
                ⭐ Yelp ({reviews.filter(r => r.source === 'yelp').length})
              </Button>
              <Button
                variant={selectedPlatform === 'internal' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlatform('internal')}
              >
                🚗 Internal ({reviews.filter(r => r.source === 'internal').length})
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Reviews Table */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text weight="bold">Recent Reviews ({filteredReviews.length})</Text>
            <DataTable
              data={filteredReviews}
              columns={reviewColumns}
              pageSize={10}
            />
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

export default function ReviewManagementPage() {
  return (
    <ToastProvider>
      <ReviewManagementPageContent />
    </ToastProvider>
  );
} 