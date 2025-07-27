import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Container, H1, Text } from '@/components/ui';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, children, ...props }, ref) => {
    return (
      <Container
        ref={ref}
        className={cn('mb-8', className)}
        {...props}
      >
        <Container>
          <Container>
            <H1>{title}</H1>
            {subtitle && (
              <Text>{subtitle}</Text>
            )}
          </Container>
          {children && (
            <Container>
              {children}
            </Container>
          )}
        </Container>
      </Container>
    );
  }
);
PageHeader.displayName = 'PageHeader';

export { PageHeader }; 