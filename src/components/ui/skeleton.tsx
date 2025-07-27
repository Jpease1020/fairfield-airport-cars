import React from 'react';
import { Container } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { cn } from '@/lib/utils/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  width, 
  height 
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
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