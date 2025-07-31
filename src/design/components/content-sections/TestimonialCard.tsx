'use client';

import React from 'react';
import { Box, Stack, Text, H4, Span } from '@/design/ui';

export interface TestimonialItem {
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar?: string;
}

export interface TestimonialCardProps {
  testimonial: TestimonialItem;
  variant?: 'default' | 'elevated' | 'minimal';
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  variant = 'default'
}) => {
  const { name, role, company, content, rating, avatar } = testimonial;

  return (
    <Box 
      variant={variant === 'elevated' ? 'elevated' : 'default'}
      padding="lg"
    >
      <Stack spacing="md">
        {/* Rating */}
        {rating && (
          <Stack direction="horizontal" spacing="xs">
            {[...Array(5)].map((_, i) => (
              <Span key={i} color={i < rating ? 'primary' : 'muted'}>
                ★
              </Span>
            ))}
          </Stack>
        )}

        {/* Content */}
        <Text variant="lead" size="md">
          "{content}"
        </Text>

        {/* Author */}
        <Stack spacing="xs">
          <H4 size="sm">{name}</H4>
          {(role || company) && (
            <Text variant="muted" size="sm">
              {role && company ? `${role} at ${company}` : role || company}
            </Text>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}; 