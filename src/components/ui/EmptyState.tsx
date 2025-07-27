import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Container, H3, Text } from '@/components/ui';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, size = 'md', ...props }) => {
    const sizeClasses = {
      sm: {
        container: 'py-8',
        icon: 'w-8 h-8',
        title: 'text-lg',
        description: 'text-sm',
      },
      md: {
        container: 'py-12',
        icon: 'w-12 h-12',
        title: 'text-xl',
        description: 'text-base',
      },
      lg: {
        container: 'py-16',
        icon: 'w-16 h-16',
        title: 'text-2xl',
        description: 'text-lg',
      },
    };

    return (
      <Container
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizeClasses[size].container,
          className
        )}
        {...props}
      >
                {icon && (
          <Container>
            {icon}
          </Container>
        )}
        {title && (
          <H3>
            {title}
          </H3>
        )}
        {description && (
          <Text>
            {description}
          </Text>
        )}
        {action && (
          <Container>
            {action}
          </Container>
        )}
      </Container>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState }; 