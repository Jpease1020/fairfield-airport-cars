import React from 'react';
import { Container, H1, Text, Link } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { Button } from './button';

export interface PageAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: PageAction[];
  theme?: 'light' | 'dark';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions = [],
  theme = 'light'
}) => {
  const renderAction = (action: PageAction, index: number) => {
    if (action.href) {
      return (
        <Link 
          key={index}
          href={action.href}
        >
          {action.label}
        </Link>
      );
    }

    return (
      <Button
        key={index}
        onClick={action.onClick}
        variant={action.variant || 'outline'}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <Container>
      <Stack spacing="md">
        <H1>{title}</H1>
        {subtitle && <Text>{subtitle}</Text>}
        {actions.length > 0 && (
          <Container>
            {actions.map(renderAction)}
          </Container>
        )}
      </Stack>
    </Container>
  );
}; 