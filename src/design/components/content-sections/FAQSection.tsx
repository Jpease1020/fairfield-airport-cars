'use client';

import React, { useState } from 'react';
import { Box, Stack, Text, H3, Button, Container, Span } from '@/ui';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  variant?: 'default' | 'accordion' | 'simple';
  spacing?: 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCards?: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  subtitle,
  items,
  variant = 'default',
  spacing = 'md',
  maxWidth = 'lg',
  showCards = true
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const renderFAQItem = (item: FAQItem, index: number) => {
    const isOpen = openItems.has(index);

    if (variant === 'simple') {
      return (
        <Stack key={index} spacing="sm">
          <H3 size="md">{item.question}</H3>
          <Text variant="muted">{item.answer}</Text>
        </Stack>
      );
    }

    if (variant === 'accordion') {
      return (
        <Box key={index} variant={showCards ? 'elevated' : 'default'} padding="md">
          <Stack direction="horizontal" spacing="md" align="center" justify="space-between">
            <Button
              variant="ghost"
              onClick={() => toggleItem(index)}
            >
              <H3 size="md" align="left">{item.question}</H3>
            </Button>
            <Span>{isOpen ? '−' : '+'}</Span>
          </Stack>
          {isOpen && (
            <Box padding="md">
              <Text variant="muted">{item.answer}</Text>
            </Box>
          )}
        </Box>
      );
    }

    // Default variant
    return (
      <Box key={index} variant={showCards ? 'elevated' : 'default'} padding="lg">
        <Stack spacing="md">
          <H3 size="md">{item.question}</H3>
          <Text variant="muted">{item.answer}</Text>
        </Stack>
      </Box>
    );
  };

  return (
    <Container maxWidth={maxWidth}>
      <Stack spacing={spacing}>
        {(title || subtitle) && (
          <Stack spacing="sm" align="center">
            {title && <H3 align="center">{title}</H3>}
            {subtitle && <Text variant="lead" align="center">{subtitle}</Text>}
          </Stack>
        )}
        
        <Stack spacing={spacing}>
          {items.map(renderFAQItem)}
        </Stack>
      </Stack>
    </Container>
  );
}; 