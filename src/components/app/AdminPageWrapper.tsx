'use client';

import React from 'react';
import { Container } from '../../design/layout/containers/Container';
import { Stack } from '../../design/layout/framing/Stack';
import { H1 } from '../../design/components/base-components/text/Headings';
import { Text } from '../../design/components/base-components/text/Text';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <Container variant="default" padding="lg">
      <Stack spacing="lg">
        {(title || subtitle) && (
          <Stack spacing="sm">
            {title && (
              <H1>
                {title}
              </H1>
            )}
            {subtitle && (
              <Text variant="muted" size="lg">
                {subtitle}
              </Text>
            )}
          </Stack>
        )}
        {children}
      </Stack>
    </Container>
  );
}; 