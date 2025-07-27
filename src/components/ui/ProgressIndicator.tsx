import React from 'react';
import { Container, Text, Span, H3 } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

// ProgressIndicator Component - BULLETPROOF TYPE SAFETY!
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  variant?: 'default' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'info';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  variant = 'default',
}) => {
  const progress = (currentStep / totalSteps) * 100;

  if (variant === 'minimal') {
    return (
      <Container>
        <Stack direction="horizontal" justify="between" align="center">
          <Span>Step {currentStep} of {totalSteps}</Span>
          <Span>{Math.round(progress)}%</Span>
        </Stack>
        <Container>
          <div style={{ width: `${progress}%` }} />
        </Container>
      </Container>
    );
  }

  if (variant === 'detailed') {
    return (
      <Container>
        <Stack spacing="md">
          <Stack direction="horizontal" justify="between" align="center">
            <H3>
              {steps[currentStep - 1]}
            </H3>
            <Span>
              {currentStep} of {totalSteps}
            </Span>
          </Stack>
          <Stack spacing="sm">
            <Container>
              <div style={{ width: `${progress}%` }} />
            </Container>
            <Stack direction="horizontal" spacing="sm">
              {steps.map((step, index) => (
                <Container key={index}>
                  <Span>{index + 1}</Span>
                </Container>
              ))}
            </Stack>
          </Stack>
          <Stack>
            {steps.map((step, index) => (
              <Container key={index}>
                <Text>{step}</Text>
              </Container>
            ))}
          </Stack>
        </Stack>
      </Container>
    );
  }

  // Default variant
  return (
    <Container>
      <Stack direction="horizontal" justify="between" align="center">
        <Span>
          {steps[currentStep - 1]}
        </Span>
        <Span>
          {currentStep} of {totalSteps}
        </Span>
      </Stack>
      <Container>
        <div style={{ width: `${progress}%` }} />
      </Container>
    </Container>
  );
};

export { ProgressIndicator }; 