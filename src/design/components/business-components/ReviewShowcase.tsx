'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Box, 
  Grid, 
  GridItem,
  Badge,
  LoadingSpinner,
  useToast
} from '@/ui';
import { Star } from 'lucide-react';
import { UnifiedReview, reviewAggregationService } from '@/lib/services/review-aggregation-service';

interface ReviewShowcaseProps {
  title?: string;
  subtitle?: string;
  maxReviews?: number;
  showPlatformBreakdown?: boolean;
  variant?: 'compact' | 'detailed' | 'hero';
}

export function ReviewShowcase({ 
  title = "What Our Customers Say",
  subtitle = "Real reviews from satisfied customers across multiple platforms",
  maxReviews = 6,
  showPlatformBreakdown = true,
  variant = 'detailed'
}: ReviewShowcaseProps) {
  const [reviews, setReviews] = useState<UnifiedReview[]>([]);
  const [aggregation, setAggregation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const [recentReviews, aggregationData] = await Promise.all([
          reviewAggregationService.getRecentReviews(maxReviews),
          reviewAggregationService.getAggregatedReviews()
        ]);
        
        setReviews(recentReviews);
        setAggregation(aggregationData);
      } catch (error) {
        // Error fetching reviews
        addToast('error', 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [maxReviews, addToast]);

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

  const renderReviewCard = (review: UnifiedReview) => (
    <Box key={review.id} variant="elevated" padding="md">
      <Stack spacing="sm">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text weight="bold" size="sm">{review.reviewerName}</Text>
          <Badge variant="default" size="sm">
            {review.platformIcon} {review.platform}
          </Badge>
        </Stack>
        
        {renderStars(review.rating)}
        
        <Text size="sm" variant="muted">
          {review.comment.length > 150 
            ? `${review.comment.substring(0, 150)}...` 
            : review.comment
          }
        </Text>
        
        <Text size="xs" variant="muted">
          {new Date(review.reviewTime).toLocaleDateString()}
        </Text>
      </Stack>
    </Box>
  );

  const renderPlatformBreakdown = () => {
    if (!aggregation || !showPlatformBreakdown) return null;

    return (
      <Box variant="outlined" padding="md">
        <Stack spacing="md">
          <Text weight="bold">Review Summary</Text>
          <Grid cols={3} gap="md">
            <GridItem>
              <Stack align="center" spacing="xs">
                <Text size="lg" weight="bold">
                  {aggregation.averageRating.toFixed(1)}
                </Text>
                <Text size="sm" variant="muted">Average Rating</Text>
                {renderStars(Math.round(aggregation.averageRating))}
              </Stack>
            </GridItem>
            
            <GridItem>
              <Stack align="center" spacing="xs">
                <Text size="lg" weight="bold">
                  {aggregation.totalReviews}
                </Text>
                <Text size="sm" variant="muted">Total Reviews</Text>
              </Stack>
            </GridItem>
            
            <GridItem>
              <Stack align="center" spacing="xs">
                <Text size="lg" weight="bold">
                  {aggregation.reviewBreakdown.google.count + aggregation.reviewBreakdown.yelp.count}
                </Text>
                <Text size="sm" variant="muted">External Reviews</Text>
              </Stack>
            </GridItem>
          </Grid>
          
          <Stack spacing="sm">
            <Text size="sm" weight="bold">Platform Breakdown:</Text>
            <Stack spacing="xs">
              {aggregation.reviewBreakdown.google.count > 0 && (
                <Stack direction="horizontal" justify="space-between">
                  <Text size="sm">🔍 Google</Text>
                  <Text size="sm">{aggregation.reviewBreakdown.google.count} reviews ({aggregation.reviewBreakdown.google.average.toFixed(1)} avg)</Text>
                </Stack>
              )}
              {aggregation.reviewBreakdown.yelp.count > 0 && (
                <Stack direction="horizontal" justify="space-between">
                  <Text size="sm">⭐ Yelp</Text>
                  <Text size="sm">{aggregation.reviewBreakdown.yelp.count} reviews ({aggregation.reviewBreakdown.yelp.average.toFixed(1)} avg)</Text>
                </Stack>
              )}
              {aggregation.reviewBreakdown.internal.count > 0 && (
                <Stack direction="horizontal" justify="space-between">
                  <Text size="sm">🚗 Our Platform</Text>
                  <Text size="sm">{aggregation.reviewBreakdown.internal.count} reviews ({aggregation.reviewBreakdown.internal.average.toFixed(1)} avg)</Text>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" padding="xl">
        <Stack align="center" spacing="md">
          <LoadingSpinner size="lg" />
          <Text>Loading reviews...</Text>
        </Stack>
      </Container>
    );
  }

  if (reviews.length === 0) {
    return (
      <Container maxWidth="lg" padding="xl">
        <Stack align="center" spacing="md">
          <Text>No reviews available yet.</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" padding="xl">
      <Stack spacing="xl">
        <Stack align="center" spacing="md">
          <Text size="xl" weight="bold" align="center">
            {title}
          </Text>
          <Text align="center" variant="muted">
            {subtitle}
          </Text>
        </Stack>

        {variant === 'hero' && renderPlatformBreakdown()}

        <Grid cols={variant === 'compact' ? 2 : 3} gap="lg" responsive>
          {reviews.map(renderReviewCard)}
        </Grid>

        {variant === 'detailed' && renderPlatformBreakdown()}
      </Stack>
    </Container>
  );
} 