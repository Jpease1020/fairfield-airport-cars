'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, spacing, borderRadius } from '../../design-system/tokens';

// Skeleton animation with enhanced performance
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

// Styled skeleton component with enhanced features
const StyledSkeleton = styled.div.withConfig({
  shouldForwardProp: (prop) => !['width', 'height', 'variant', 'animated', 'wave', 'rounded'].includes(prop)
})<{
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  height: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant: 'text' | 'circular' | 'rectangular' | 'rounded';
  animated: boolean;
  wave: boolean;
  rounded: 'sm' | 'md' | 'lg' | 'xl';
}>`
  background-color: ${colors.gray[200]};
  display: block;
  position: relative;
  overflow: hidden;
  
  /* Width styles */
  ${({ width }) => {
    switch (width) {
      case 'xs':
        return `width: 4rem;`;
      case 'sm':
        return `width: 6rem;`;
      case 'md':
        return `width: 8rem;`;
      case 'lg':
        return `width: 12rem;`;
      case 'xl':
        return `width: 16rem;`;
      case 'full':
        return `width: 100%;`;
      case 'auto':
        return `width: auto;`;
      default:
        return `width: 8rem;`;
    }
  }}

  /* Height styles */
  ${({ height }) => {
    switch (height) {
      case 'xs':
        return `height: 1rem;`;
      case 'sm':
        return `height: 1.5rem;`;
      case 'md':
        return `height: 2rem;`;
      case 'lg':
        return `height: 3rem;`;
      case 'xl':
        return `height: 4rem;`;
      default:
        return `height: 2rem;`;
    }
  }}

  /* Variant styles */
  ${({ variant, rounded }) => {
    switch (variant) {
      case 'text':
        return `border-radius: ${borderRadius[rounded]};`;
      case 'circular':
        return `border-radius: 50%;`;
      case 'rectangular':
        return `border-radius: 0;`;
      case 'rounded':
        return `border-radius: ${borderRadius[rounded]};`;
      default:
        return `border-radius: ${borderRadius[rounded]};`;
    }
  }}

  /* Animation styles */
  ${({ animated, wave }) => {
    if (wave) {
      return `
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: ${wave} 1.5s ease-in-out infinite;
        }
      `;
    }
    if (animated) {
      return `animation: ${pulse} 1.5s ease-in-out infinite;`;
    }
    return '';
  }}
`;

// Styled skeleton wrapper with enhanced layout
const SkeletonWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['padding', 'background'].includes(prop)
})<{
  padding: 'none' | 'sm' | 'md' | 'lg';
  background: 'none' | 'light' | 'medium';
}>`
  padding: ${({ padding }) => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return spacing.sm;
      case 'md': return spacing.md;
      case 'lg': return spacing.lg;
      default: return spacing.md;
    }
  }};
  
  background-color: ${({ background }) => {
    switch (background) {
      case 'none': return 'transparent';
      case 'light': return colors.gray[50];
      case 'medium': return colors.gray[100];
      default: return 'transparent';
    }
  }};
  border-radius: ${borderRadius.default};
`;

// Styled skeleton stack with enhanced spacing
const SkeletonStackWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['spacing', 'direction'].includes(prop)
})<{ 
  spacing: 'sm' | 'md' | 'lg';
  direction: 'vertical' | 'horizontal';
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction === 'horizontal' ? 'row' : 'column'};
  
  ${({ direction, spacing: spacingProp }) => {
    const gap = spacingProp === 'sm' ? spacing.sm : spacingProp === 'lg' ? spacing.lg : spacing.md;
    
    if (direction === 'horizontal') {
      return `
        gap: ${gap};
        align-items: center;
      `;
    } else {
      return `
        gap: ${gap};
      `;
    }
  }}
`;

// Styled skeleton grid with enhanced layout
const SkeletonGridWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns', 'gap'].includes(prop)
})<{
  columns: 1 | 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg';
}>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  gap: ${({ gap }) => {
    switch (gap) {
      case 'sm': return spacing.sm;
      case 'md': return spacing.md;
      case 'lg': return spacing.lg;
      default: return spacing.md;
    }
  }};
`;

export interface SkeletonProps {
  // Core props
  children?: React.ReactNode;
  
  // Appearance
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Behavior
  animated?: boolean;
  wave?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  
  // Rest props
  [key: string]: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  // Core props
  children,
  
  // Appearance
  width = 'md', 
  height = 'md',
  variant = 'rectangular',
  rounded = 'md',
  
  // Behavior
  animated = true,
  wave = false,
  
  // Accessibility
  'aria-label': ariaLabel,
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledSkeleton
      width={width}
      height={height}
      variant={variant}
      rounded={rounded}
      animated={animated}
      wave={wave}
      role="status"
      aria-label={ariaLabel || 'Loading...'}
      aria-busy="true"
      {...rest}
    >
      {children}
    </StyledSkeleton>
  );
};

Skeleton.displayName = 'Skeleton';

// Enhanced container components
export const SkeletonContainer: React.FC<{
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'none' | 'light' | 'medium';
  [key: string]: any;
}> = ({ 
  children, 
  padding = 'md', 
  background = 'none',
  ...rest 
}) => (
  <SkeletonWrapper padding={padding} background={background} {...rest}>
    {children}
  </SkeletonWrapper>
);

export const SkeletonStack: React.FC<{
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  direction?: 'vertical' | 'horizontal';
  [key: string]: any;
}> = ({ 
  children, 
  spacing = 'md', 
  direction = 'vertical',
  ...rest 
}) => (
  <SkeletonStackWrapper spacing={spacing} direction={direction} {...rest}>
    {children}
  </SkeletonStackWrapper>
);

export const SkeletonGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}> = ({ 
  children, 
  columns = 2, 
  gap = 'md',
  ...rest 
}) => (
  <SkeletonGridWrapper columns={columns} gap={gap} {...rest}>
    {children}
  </SkeletonGridWrapper>
);

// Pre-built skeleton components for common use cases
export const BookingFormSkeleton = () => (
  <SkeletonContainer padding="lg" background="light">
    <SkeletonStack spacing="lg">
      <SkeletonStack spacing="md">
        <Skeleton width="full" height="md" variant="text" />
        <Skeleton width="full" height="md" variant="text" />
      </SkeletonStack>
      <SkeletonGrid columns={2} gap="md">
        {[...Array(4)].map((_, i) => (
          <SkeletonStack key={i} spacing="sm">
            <Skeleton width="auto" height="sm" variant="text" />
            <Skeleton width="full" height="md" variant="text" />
          </SkeletonStack>
        ))}
      </SkeletonGrid>
      <Skeleton width="full" height="lg" variant="rounded" />
    </SkeletonStack>
  </SkeletonContainer>
);

export const BookingCardSkeleton = () => (
  <SkeletonContainer padding="md" background="light">
    <SkeletonStack spacing="md">
      <SkeletonStack spacing="md">
        <Skeleton width="full" height="md" variant="text" />
        <Skeleton width="full" height="md" variant="text" />
      </SkeletonStack>
      <Skeleton width="full" height="lg" variant="rounded" />
    </SkeletonStack>
    <SkeletonStack spacing="sm">
      <Skeleton width="auto" height="sm" variant="text" />
      <Skeleton width="auto" height="sm" variant="text" />
    </SkeletonStack>
    <SkeletonStack spacing="sm">
      <Skeleton width="auto" height="sm" variant="text" />
      <Skeleton width="auto" height="sm" variant="text" />
    </SkeletonStack>
  </SkeletonContainer>
);

export const AdminDashboardSkeleton = () => (
  <SkeletonContainer padding="lg" background="light">
    <SkeletonStack spacing="lg">
      {[...Array(5)].map((_, i) => (
        <SkeletonContainer key={i} padding="md" background="medium">
          <SkeletonStack spacing="md">
            <Skeleton width="auto" height="md" variant="text" />
            <SkeletonStack spacing="md">
              <Skeleton width="auto" height="sm" variant="text" />
              <Skeleton width="auto" height="sm" variant="text" />
            </SkeletonStack>
          </SkeletonStack>
        </SkeletonContainer>
      ))}
    </SkeletonStack>
    <SkeletonStack spacing="lg">
      {[...Array(2)].map((_, i) => (
        <SkeletonContainer key={i} padding="md" background="medium">
          <Skeleton width="auto" height="md" variant="text" />
          <SkeletonStack spacing="md">
            {[...Array(4)].map((_, j) => (
              <SkeletonContainer key={j} padding="sm">
                <Skeleton width="auto" height="sm" variant="text" />
                <Skeleton width="auto" height="sm" variant="text" />
              </SkeletonContainer>
            ))}
          </SkeletonStack>
        </SkeletonContainer>
      ))}
    </SkeletonStack>
  </SkeletonContainer>
);

export const PageSkeleton = () => (
  <SkeletonContainer padding="lg" background="light">
    <SkeletonStack spacing="lg">
      <SkeletonStack spacing="md">
        <Skeleton width="auto" height="lg" variant="text" />
        <Skeleton width="auto" height="md" variant="text" />
      </SkeletonStack>
      <SkeletonStack spacing="md">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} width="full" height="md" variant="text" />
        ))}
      </SkeletonStack>
      <SkeletonStack spacing="md">
        <Skeleton width="auto" height="md" variant="text" />
        <Skeleton width="auto" height="md" variant="text" />
      </SkeletonStack>
    </SkeletonStack>
  </SkeletonContainer>
);

export const TableSkeleton = () => (
  <SkeletonContainer padding="md" background="light">
    <SkeletonStack spacing="md">
      {[...Array(5)].map((_, i) => (
        <SkeletonStack key={i} direction="horizontal" spacing="md">
          <Skeleton width="auto" height="sm" variant="text" />
          <Skeleton width="auto" height="sm" variant="text" />
          <Skeleton width="auto" height="sm" variant="text" />
          <Skeleton width="auto" height="sm" variant="text" />
        </SkeletonStack>
      ))}
    </SkeletonStack>
  </SkeletonContainer>
);

export const ProfileSkeleton = () => (
  <SkeletonContainer padding="lg" background="light">
    <SkeletonStack spacing="lg">
      <SkeletonStack direction="horizontal" spacing="md">
        <Skeleton width="xl" height="xl" variant="circular" />
        <SkeletonStack spacing="sm">
          <Skeleton width="auto" height="md" variant="text" />
          <Skeleton width="auto" height="sm" variant="text" />
        </SkeletonStack>
      </SkeletonStack>
      <SkeletonStack spacing="md">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} width="full" height="md" variant="text" />
        ))}
      </SkeletonStack>
    </SkeletonStack>
  </SkeletonContainer>
); 