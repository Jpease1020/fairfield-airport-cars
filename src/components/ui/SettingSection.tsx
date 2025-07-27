import React from 'react';
import { Card, CardHeader, CardBody } from './card';
import { Container, Text, H3, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

export interface SettingSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  description,
  icon,
  children,
  actions
}) => {
  return (
    <Card>
      <CardHeader>
        <Stack direction="horizontal" justify="between" align="start">
          <Stack>
            <Stack direction="horizontal" spacing="sm" align="center">
              {icon && (
                <Span>
                  {icon}
                </Span>
              )}
              <H3>
                {title}
              </H3>
            </Stack>
            {description && (
              <Text>
                {description}
              </Text>
            )}
          </Stack>
          
          {actions && (
            <Container>
              {actions}
            </Container>
          )}
        </Stack>
      </CardHeader>
      
      <CardBody>
        {children}
      </CardBody>
    </Card>
  );
}; 