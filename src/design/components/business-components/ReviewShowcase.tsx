'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '../../layout/containers/Container';
import { Text } from '../base-components/text/Text';
import { Stack } from '../../layout/framing/Stack';
import { Card } from '../../layout/content/Card';
import { StarRating } from '../base-components/StarRating';
import { Badge } from '../base-components/Badge';
import { LoadingSpinner } from '../base-components/notifications/LoadingSpinner';
import { Star } from 'lucide-react';
import { Grid, GridItem } from '../../layout/framing/Grid';

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
  const [reviews, setReviews] = useState<any[]>([]);
  const [aggregation, setAggregation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const [recentReviews, aggregationData] = await Promise.all([
          // Reviews functionality temporarily disabled - service was deleted during cleanup
          Promise.resolve([]),
          Promise.resolve({})
        ]);
        
        setReviews(recentReviews);
        setAggregation(aggregationData);
      } catch (error) {
        // Error fetching reviews
        // Failed to load reviews - handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [maxReviews]);

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

  const renderReviewCard = (review: any) => (
    <Card key={review.id} variant="elevated" padding="md">
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
    </Card>
  );

  const renderPlatformBreakdown = () => {
    if (!aggregation || !showPlatformBreakdown) return null;

    const platforms = [
      { name: 'Google', icon: '🔍', rating: 4.8, reviews: 127 },
      { name: 'Yelp', icon: '⭐', rating: 4.7, reviews: 89 },
      { name: 'Facebook', icon: '📘', rating: 4.9, reviews: 156 },
      { name: 'TripAdvisor', icon: '🗺️', rating: 4.6, reviews: 73 }
    ];

    return (
      <Stack direction="vertical" spacing="md">
        <Text variant="lead" weight="bold">Platform Ratings</Text>
        <Grid cols={2} gap="md">
          {platforms.map((platform) => (
            <GridItem key={platform.name}>
              <Card variant="default" padding="sm">
                <Stack direction="vertical" spacing="xs" align="center">
                  <Text size="lg">{platform.icon}</Text>
                  <Text weight="semibold" size="sm">{platform.name}</Text>
                  <StarRating rating={platform.rating} size="sm" />
                  <Text size="xs" variant="muted">{platform.reviews} reviews</Text>
                </Stack>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </Stack>
    );
  };

  if (loading) {
    return (
      <Container variant="default" padding="md">
        <LoadingSpinner text="Loading reviews..." />
      </Container>
    );
  }

  return (
    <Container variant="default" padding="md">
      <Stack direction="vertical" spacing="lg">
        {/* Header */}
        <Stack direction="vertical" spacing="sm" align="center">
          <Text variant="lead" weight="bold" align="center">
            {title}
          </Text>
          <Text variant="body" color="muted" align="center">
            {subtitle}
          </Text>
        </Stack>

        {/* Platform Breakdown */}
        {variant === 'detailed' && renderPlatformBreakdown()}

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <Grid cols={variant === 'compact' ? 1 : 3} gap="lg">
            {reviews.slice(0, maxReviews).map((review) => (
              <GridItem key={review.id}>
                {renderReviewCard(review)}
              </GridItem>
            ))}
          </Grid>
        ) : (
          <Stack direction="vertical" spacing="md" align="center">
            <Text variant="body" color="muted">No reviews available yet</Text>
            <Text variant="small" color="muted">Be the first to leave a review!</Text>
          </Stack>
        )}

        {/* Call to Action */}
        {variant === 'hero' && (
          <Stack direction="vertical" spacing="md" align="center">
            <Text variant="body" weight="semibold">
              Ready to experience our service?
            </Text>
            <Text variant="small" color="muted">
              Join thousands of satisfied customers
            </Text>
          </Stack>
        )}
      </Stack>
    </Container>
  );
} 