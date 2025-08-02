'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Box, 
  Badge,
  LoadingSpinner
} from '@/ui';
import { Star, CheckCircle } from 'lucide-react';
import { reviewAggregationService } from '@/lib/services/review-aggregation-service';

interface ReviewTrustSignalProps {
  variant?: 'compact' | 'detailed';
  showOnMobile?: boolean;
}

export function ReviewTrustSignal({ 
  variant = 'compact',
  showOnMobile = true 
}: ReviewTrustSignalProps) {
  const [aggregation, setAggregation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAggregation = async () => {
      try {
        setLoading(true);
        const data = await reviewAggregationService.getAggregatedReviews();
        setAggregation(data);
      } catch (error) {
        // Error fetching review aggregation
      } finally {
        setLoading(false);
      }
    };

    fetchAggregation();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <Stack direction="horizontal" spacing="xs">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? 'var(--color-yellow-500)' : 'var(--color-gray-300)'}
            color={star <= rating ? 'var(--color-yellow-500)' : 'var(--color-gray-300)'}
          />
        ))}
      </Stack>
    );
  };

  if (loading) {
    return (
      <Box variant="outlined" padding="sm">
        <Stack direction="horizontal" align="center" spacing="sm">
          <LoadingSpinner size="sm" />
          <Text size="sm">Loading reviews...</Text>
        </Stack>
      </Box>
    );
  }

  if (!aggregation || aggregation.totalReviews === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <Box variant="outlined" padding="sm">
        <Stack direction="horizontal" align="center" justify="space-between">
          <Stack direction="horizontal" align="center" spacing="sm">
            {renderStars(Math.round(aggregation.averageRating))}
            <Text size="sm" weight="bold">
              {aggregation.averageRating.toFixed(1)}
            </Text>
            <Text size="sm" variant="muted">
              ({aggregation.totalReviews} reviews)
            </Text>
          </Stack>
          
          <Stack direction="horizontal" align="center" spacing="xs">
            <CheckCircle size={16} color="var(--color-green-500)" />
            <Text size="xs" variant="muted">Verified Service</Text>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box variant="outlined" padding="md">
      <Stack spacing="md">
        <Stack direction="horizontal" align="center" justify="space-between">
          <Text weight="bold" size="sm">Customer Satisfaction</Text>
          <Badge variant="success" size="sm">
            <CheckCircle size={12} />
            Verified
          </Badge>
        </Stack>
        
        <Stack direction="horizontal" align="center" spacing="md">
          {renderStars(Math.round(aggregation.averageRating))}
          <Stack spacing="xs">
            <Text size="lg" weight="bold">
              {aggregation.averageRating.toFixed(1)}/5
            </Text>
            <Text size="sm" variant="muted">
              {aggregation.totalReviews} verified reviews
            </Text>
          </Stack>
        </Stack>
        
        <Stack spacing="xs">
          <Text size="sm" weight="bold">Platform Ratings:</Text>
          <Stack spacing="xs">
            {aggregation.reviewBreakdown.google.count > 0 && (
              <Stack direction="horizontal" justify="space-between">
                <Text size="sm">🔍 Google</Text>
                <Text size="sm">{aggregation.reviewBreakdown.google.average.toFixed(1)}/5</Text>
              </Stack>
            )}
            {aggregation.reviewBreakdown.yelp.count > 0 && (
              <Stack direction="horizontal" justify="space-between">
                <Text size="sm">⭐ Yelp</Text>
                <Text size="sm">{aggregation.reviewBreakdown.yelp.average.toFixed(1)}/5</Text>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
} 