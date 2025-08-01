'use client';

import React from 'react';
import { Box, Stack, Text, H3, Button, Container, Grid, GridItem } from '@/design/ui';
import Link from 'next/link';

export interface ContactMethod {
  type: 'phone' | 'email' | 'text' | 'whatsapp';
  label: string;
  value: string;
  href: string;
}

export interface ContactMethodsProps {
  title?: string;
  subtitle?: string;
  description?: string;
  contactMethods: ContactMethod[];
  variant?: 'default' | 'centered' | 'split';
}

export const ContactMethods: React.FC<ContactMethodsProps> = ({
  title,
  subtitle,
  description,
  contactMethods,
  variant = 'default'
}) => {
  const getContactIcon = (type: ContactMethod['type']) => {
    switch (type) {
      case 'phone': return '📞';
      case 'email': return '✉️';
      case 'text': return '💬';
      case 'whatsapp': return '📱';
      default: return '📞';
    }
  };

  const renderContactMethod = (method: ContactMethod) => (
    <Box key={method.type} variant="elevated" padding="lg">
      <Stack spacing="md" align="center">
        <Text size="xl">{getContactIcon(method.type)}</Text>
        <Stack spacing="xs" align="center">
          <Text variant="muted" size="sm">{method.label}</Text>
          <Text size="md">{method.value}</Text>
        </Stack>
        <Link href={method.href}>
          <Button variant="outline" size="sm">
            Contact
          </Button>
        </Link>
      </Stack>
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <Stack spacing="xl">
        {(title || subtitle || description) && (
          <Stack spacing="md" align={variant === 'centered' ? 'center' : 'flex-start'}>
            {title && <H3 align={variant === 'centered' ? 'center' : 'left'}>{title}</H3>}
            {subtitle && <Text variant="lead" align={variant === 'centered' ? 'center' : 'left'}>{subtitle}</Text>}
            {description && <Text variant="muted" align={variant === 'centered' ? 'center' : 'left'}>{description}</Text>}
          </Stack>
        )}
        
        <Grid cols={contactMethods.length > 2 ? 3 : (contactMethods.length as 1 | 2)} gap="lg">
          {contactMethods.map(renderContactMethod)}
        </Grid>
      </Stack>
    </Container>
  );
}; 