import React from 'react';
import { Container, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

/**
 * A flexible loading spinner component with multiple variants and sizes
 * 
 * @example
 * // Basic usage
 * <LoadingSpinner />
 * 
 * // With text
 * <LoadingSpinner text="Loading..." />
 * 
 * // Dots variant
 * <LoadingSpinner variant="dots" />
 * ```
 */
interface LoadingSpinnerProps {
  /** The size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** The variant of the spinner */
  variant?: 'spinner' | 'dots' | 'pulse';
  /** Text to display with the spinner */
  text?: string;
  /** Whether the spinner should be centered */
  centered?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'spinner',
  text,
  centered = false,
}) => {
  const SpinnerComponent = () => {
    switch (variant) {
      case 'dots':
        return (
          <Stack direction="horizontal" spacing="xs">
            {[...Array(3)].map((_, i) => (
              <Container key={i}>
                <Span>•</Span>
              </Container>
            ))}
          </Stack>
        );

      case 'pulse':
        return (
          <Container>
            <Span>●</Span>
          </Container>
        );

      default:
          return (
    <Container>
      <Span>○</Span>
    </Container>
  );
    }
  };

  const content = (
    <Container>
      <SpinnerComponent />
      {text && (
        <Span>{text}</Span>
      )}
    </Container>
  );

  if (centered) {
    return (
      <Stack align="center">
        {content}
      </Stack>
    );
  }

  return content;
};

export { LoadingSpinner }; 