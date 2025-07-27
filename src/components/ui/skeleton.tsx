import React from 'react';
import { Container } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { cn } from '@/lib/utils/utils';

// Skeleton Component - BULLETPROOF TYPE SAFETY!
interface SkeletonProps {
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = 'md', 
  height = 'md',
  variant = 'rectangular',
  animated = true
}) => {
  const widthClasses = {
    xs: 'w-16',
    sm: 'w-24', 
    md: 'w-32',
    lg: 'w-48',
    xl: 'w-64',
    full: 'w-full'
  };

  const heightClasses = {
    xs: 'h-4',
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12',
    xl: 'h-16'
  };

  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md'
  };

  return (
    <div 
      className={cn(
        'bg-gray-200',
        widthClasses[width],
        heightClasses[height],
        variantClasses[variant],
        animated && 'animate-pulse'
      )}
    />
  );
};

// Pre-built skeleton components for common use cases
export const BookingFormSkeleton = () => (
  <Container>
    <Container>
      <Skeleton />
      <Container>
        {[...Array(4)].map((_, i) => (
          <Container key={i}>
            <Skeleton />
            <Skeleton />
          </Container>
        ))}
      </Container>
    </Container>
    <Skeleton />
  </Container>
);

export const BookingCardSkeleton = () => (
  <Container>
    <Stack spacing="md">
      <Stack>
        <Skeleton />
        <Skeleton />
      </Stack>
      <Skeleton />
    </Stack>
    <Stack spacing="sm">
      <Skeleton />
      <Skeleton />
    </Stack>
    <Stack spacing="sm">
      <Skeleton />
      <Skeleton />
    </Stack>
  </Container>
);

export const AdminDashboardSkeleton = () => (
  <Container>
    <Stack spacing="lg">
      {[...Array(5)].map((_, i) => (
        <Container key={i}>
          <Stack>
            <Skeleton />
            <Stack>
              <Skeleton />
              <Skeleton />
            </Stack>
          </Stack>
        </Container>
      ))}
    </Stack>
    <Stack spacing="lg">
      {[...Array(2)].map((_, i) => (
        <Container key={i}>
          <Skeleton />
          <Stack>
            {[...Array(4)].map((_, j) => (
              <Container key={j}>
                <Skeleton />
                <Skeleton />
              </Container>
            ))}
          </Stack>
        </Container>
      ))}
    </Stack>
  </Container>
);

export const PageSkeleton = () => (
  <Container>
    <Stack spacing="lg">
      <Stack>
        <Skeleton />
        <Skeleton />
      </Stack>
      <Stack>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </Stack>
      <Stack>
        <Skeleton />
        <Skeleton />
      </Stack>
    </Stack>
  </Container>
); 