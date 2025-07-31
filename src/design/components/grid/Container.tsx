'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows, transitions, margins } from '../../system/tokens/tokens';

// Container system components
interface ContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  as?: 'div' | 'main' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  id?: string;
}

const StyledContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'maxWidth', 'padding', 'margin', 'marginTop', 'marginBottom', 'spacing'].includes(prop)
})<{
  variant: 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated';
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}>`
  transition: ${transitions.default};

  /* Max width styles */
  ${({ maxWidth }) => {
    switch (maxWidth) {
      case 'sm':
        return `max-width: 24rem;`;
      case 'md':
        return `max-width: 28rem;`;
      case 'lg':
        return `max-width: 32rem;`;
      case 'xl':
        return `max-width: 36rem;`;
      case '2xl':
        return `max-width: 42rem;`;
      case 'full':
        return `max-width: 100%;`;
      default:
        return `max-width: 36rem;`;
    }
  }}

  /* Padding styles */
  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return `padding: 0;`;
      case 'xs':
        return `padding: ${spacing.xs};`;
      case 'sm':
        return `padding: ${spacing.sm};`;
      case 'md':
        return `padding: ${spacing.md};`;
      case 'lg':
        return `padding: ${spacing.lg};`;
      case 'xl':
        return `padding: ${spacing.xl};`;
      case '2xl':
        return `padding: ${spacing['2xl']};`;
      default:
        return `padding: ${spacing.md};`;
    }
  }}

  /* Margin styles */
  ${({ margin }) => {
    switch (margin) {
      case 'none':
        return `margin: 0 auto;`; // Center the container
      case 'xs':
        return `margin: ${spacing.xs} auto;`;
      case 'sm':
        return `margin: ${spacing.sm} auto;`;
      case 'md':
        return `margin: ${spacing.md} auto;`;
      case 'lg':
        return `margin: ${spacing.lg} auto;`;
      case 'xl':
        return `margin: ${spacing.xl} auto;`;
      case '2xl':
        return `margin: ${spacing['2xl']} auto;`;
      default:
        return `margin: 0 auto;`; // Center the container
    }
  }}

  /* Margin top styles */
  ${({ marginTop }) => {
    switch (marginTop) {
      case 'none':
        return `margin-top: 0;`;
      case 'xs':
        return `margin-top: ${spacing.xs};`;
      case 'sm':
        return `margin-top: ${spacing.sm};`;
      case 'md':
        return `margin-top: ${spacing.md};`;
      case 'lg':
        return `margin-top: ${spacing.lg};`;
      case 'xl':
        return `margin-top: ${spacing.xl};`;
      case '2xl':
        return `margin-top: ${spacing['2xl']};`;
      default:
        return `margin-top: 0;`;
    }
  }}

  /* Margin bottom styles */
  ${({ marginBottom }) => {
    switch (marginBottom) {
      case 'none':
        return `margin-bottom: 0;`;
      case 'xs':
        return `margin-bottom: ${spacing.xs};`;
      case 'sm':
        return `margin-bottom: ${spacing.sm};`;
      case 'md':
        return `margin-bottom: ${spacing.md};`;
      case 'lg':
        return `margin-bottom: ${spacing.lg};`;
      case 'xl':
        return `margin-bottom: ${spacing.xl};`;
      case '2xl':
        return `margin-bottom: ${spacing['2xl']};`;
      default:
        return `margin-bottom: 0;`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'card':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.default};
          box-shadow: ${shadows.default};
        `;
      case 'section':
        return `
          background-color: ${colors.background.secondary};
          border-radius: ${borderRadius.default};
        `;
      case 'main':
        return `
          background-color: ${colors.background.primary};
          min-height: 100vh;
        `;
      case 'content':
        return `
          background-color: ${colors.background.primary};
          border-radius: ${borderRadius.default};
        `;
      case 'navigation':
        return `
          background-color: ${colors.background.primary};
          border-bottom: 1px solid ${colors.border.default};
        `;
      case 'tooltip':
        return `
          background-color: ${colors.background.secondary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.sm};
          box-shadow: ${shadows.lg};
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.default};
          box-shadow: ${shadows.lg};
        `;
      default:
        return `
          background-color: transparent;
        `;
    }
  }}
`;

export const Container: React.FC<ContainerProps> = ({ 
  children,
  variant = 'default',
  maxWidth = '2xl', 
  padding = 'md', 
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  spacing = 'none',
  as: Component = 'div',
  id,
  ...rest
}) => {
  return (
    <StyledContainer
      variant={variant}
      maxWidth={maxWidth}
      padding={padding}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      spacing={spacing}
      as={Component}
      id={id}
      {...rest}
    >
      {children}
    </StyledContainer>
  );
};

// Box component
// Box component moved to separate file: Box.tsx

// Section component
interface SectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'alternate' | 'brand' | 'muted' | 'hero' | 'cta';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fullWidth?: boolean;
  as?: 'section' | 'div' | 'article' | 'main' | 'aside' | 'header' | 'footer';
  id?: string;
}

const StyledSection = styled.section.withConfig({
  shouldForwardProp: (prop) => !['variant', 'padding', 'margin', 'marginTop', 'marginBottom'].includes(prop)
})<{
  variant: 'default' | 'alternate' | 'brand' | 'muted' | 'hero' | 'cta';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}>`
  transition: ${transitions.default};

  /* Padding styles */
  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return `padding: 0;`;
      case 'xs':
        return `padding: ${spacing.xs};`;
      case 'sm':
        return `padding: ${spacing.sm};`;
      case 'md':
        return `padding: ${spacing.md};`;
      case 'lg':
        return `padding: ${spacing.lg};`;
      case 'xl':
        return `padding: ${spacing.xl};`;
      case '2xl':
        return `padding: ${spacing['2xl']};`;
      default:
        return `padding: ${spacing.lg};`;
    }
  }}

  /* Margin styles */
  ${({ margin }) => {
    switch (margin) {
      case 'none':
        return `margin: 0;`;
      case 'xs':
        return `margin: ${spacing.xs};`;
      case 'sm':
        return `margin: ${spacing.sm};`;
      case 'md':
        return `margin: ${spacing.md};`;
      case 'lg':
        return `margin: ${spacing.lg};`;
      case 'xl':
        return `margin: ${spacing.xl};`;
      case '2xl':
        return `margin: ${spacing['2xl']};`;
      default:
        return `margin: 0;`;
    }
  }}

  /* Margin top styles */
  ${({ marginTop }) => {
    switch (marginTop) {
      case 'none':
        return `margin-top: 0;`;
      case 'xs':
        return `margin-top: ${spacing.xs};`;
      case 'sm':
        return `margin-top: ${spacing.sm};`;
      case 'md':
        return `margin-top: ${spacing.md};`;
      case 'lg':
        return `margin-top: ${spacing.lg};`;
      case 'xl':
        return `margin-top: ${spacing.xl};`;
      case '2xl':
        return `margin-top: ${spacing['2xl']};`;
      default:
        return `margin-top: 0;`;
    }
  }}

  /* Margin bottom styles */
  ${({ marginBottom }) => {
    switch (marginBottom) {
      case 'none':
        return `margin-bottom: 0;`;
      case 'xs':
        return `margin-bottom: ${spacing.xs};`;
      case 'sm':
        return `margin-bottom: ${spacing.sm};`;
      case 'md':
        return `margin-bottom: ${spacing.md};`;
      case 'lg':
        return `margin-bottom: ${spacing.lg};`;
      case 'xl':
        return `margin-bottom: ${spacing.xl};`;
      case '2xl':
        return `margin-bottom: ${spacing['2xl']};`;
      default:
        return `margin-bottom: 0;`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'alternate':
        return `
          background-color: ${colors.background.secondary};
        `;
      case 'brand':
        return `
          background-color: ${colors.primary[50]};
          color: ${colors.primary[900]};
        `;
      case 'muted':
        return `
          background-color: ${colors.gray[50]};
          color: ${colors.gray[700]};
        `;
      case 'hero':
        return `
          background-color: ${colors.primary[600]};
          color: ${colors.text.white};
        `;
      case 'cta':
        return `
          background-color: ${colors.success[600]};
          color: ${colors.text.white};
        `;
      default:
        return `
          background-color: transparent;
        `;
    }
  }}
`;

const Section: React.FC<SectionProps> = ({ 
  variant = 'default', 
  padding = 'lg', 
  container = true, 
  maxWidth = '2xl',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  fullWidth = false,
  as: Component = 'section',
  children,
  id,
  ...rest
}) => {
  if (container && !fullWidth) {
    return (
      <StyledSection
        variant={variant}
        padding={padding}
        margin={margin}
        marginTop={marginTop}
        marginBottom={marginBottom}
        as={Component}
        id={id}
        {...rest}
      >
        <Container maxWidth={maxWidth}>
          {children}
        </Container>
      </StyledSection>
    );
  }

  return (
    <StyledSection
      variant={variant}
      padding={padding}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      as={Component}
      id={id}
      {...rest}
    >
      {children}
    </StyledSection>
  );
};

// Card component
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fullWidth?: boolean;
  as?: 'div' | 'article' | 'section';
  id?: string;
}

const StyledCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'padding', 'hover', 'margin', 'marginTop', 'marginBottom', 'fullWidth'].includes(prop)
})<{
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  padding: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover: boolean;
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fullWidth: boolean;
}>`
  transition: ${transitions.default};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};

  /* Padding styles */
  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return `padding: 0;`;
      case 'sm':
        return `padding: ${spacing.sm};`;
      case 'md':
        return `padding: ${spacing.md};`;
      case 'lg':
        return `padding: ${spacing.lg};`;
      case 'xl':
        return `padding: ${spacing.xl};`;
      default:
        return `padding: ${spacing.md};`;
    }
  }}

  /* Margin styles */
  ${({ margin }) => {
    switch (margin) {
      case 'none':
        return `margin: 0;`;
      case 'xs':
        return `margin: ${spacing.xs};`;
      case 'sm':
        return `margin: ${spacing.sm};`;
      case 'md':
        return `margin: ${spacing.md};`;
      case 'lg':
        return `margin: ${spacing.lg};`;
      case 'xl':
        return `margin: ${spacing.xl};`;
      case '2xl':
        return `margin: ${spacing['2xl']};`;
      default:
        return `margin: 0;`;
    }
  }}

  /* Margin top styles */
  ${({ marginTop }) => {
    switch (marginTop) {
      case 'none':
        return `margin-top: 0;`;
      case 'xs':
        return `margin-top: ${spacing.xs};`;
      case 'sm':
        return `margin-top: ${spacing.sm};`;
      case 'md':
        return `margin-top: ${spacing.md};`;
      case 'lg':
        return `margin-top: ${spacing.lg};`;
      case 'xl':
        return `margin-top: ${spacing.xl};`;
      case '2xl':
        return `margin-top: ${spacing['2xl']};`;
      default:
        return `margin-top: 0;`;
    }
  }}

  /* Margin bottom styles */
  ${({ marginBottom }) => {
    switch (marginBottom) {
      case 'none':
        return `margin-bottom: 0;`;
      case 'xs':
        return `margin-bottom: ${spacing.xs};`;
      case 'sm':
        return `margin-bottom: ${spacing.sm};`;
      case 'md':
        return `margin-bottom: ${spacing.md};`;
      case 'lg':
        return `margin-bottom: ${spacing.lg};`;
      case 'xl':
        return `margin-bottom: ${spacing.xl};`;
      case '2xl':
        return `margin-bottom: ${spacing['2xl']};`;
      default:
        return `margin-bottom: 0;`;
    }
  }}

  /* Variant styles */
  ${({ variant, hover }) => {
    switch (variant) {
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.default};
          box-shadow: ${shadows.lg};
          ${hover ? `
            &:hover {
              box-shadow: ${shadows.xl};
              transform: translateY(-2px);
            }
          ` : ''}
        `;
      case 'outlined':
        return `
          background-color: transparent;
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.default};
          ${hover ? `
            &:hover {
              border-color: ${colors.primary[300]};
              box-shadow: ${shadows.sm};
            }
          ` : ''}
        `;
      case 'filled':
        return `
          background-color: ${colors.background.secondary};
          border-radius: ${borderRadius.default};
          ${hover ? `
            &:hover {
              background-color: ${colors.background.primary};
            }
          ` : ''}
        `;
      default:
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.default};
          ${hover ? `
            &:hover {
              box-shadow: ${shadows.default};
            }
          ` : ''}
        `;
    }
  }}
`;

export const Card: React.FC<CardProps> = ({ 
    variant = 'default', 
    padding = 'md', 
    hover = false,
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    fullWidth = false,
    as: Component = 'div',
    children,
    id,
    ...rest
  }) => {
      return (
      <StyledCard
        variant={variant}
        padding={padding}
        hover={hover}
        margin={margin}
        marginTop={marginTop}
        marginBottom={marginBottom}
        fullWidth={fullWidth}
        as={Component}
        id={id}
        {...rest}
      >
        {children}
      </StyledCard>
    );
};

// Stack component
interface StackProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fullWidth?: boolean;
  as?: 'div' | 'section' | 'article' | 'nav' | 'header' | 'footer';
  id?: string;
}

const StyledStack = styled.div.withConfig({
  shouldForwardProp: (prop) => !['direction', 'spacing', 'align', 'justify', 'wrap', 'gap', 'margin', 'marginTop', 'marginBottom', 'fullWidth'].includes(prop)
})<{
  direction: 'horizontal' | 'vertical';
  spacing: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align: 'start' | 'center' | 'end' | 'stretch';
  justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fullWidth: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction === 'horizontal' ? 'row' : 'column'};
  align-items: ${({ align }) => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      default:
        return 'flex-start';
    }
  }};
  justify-content: ${({ justify }) => {
    switch (justify) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'between':
        return 'space-between';
      case 'around':
        return 'space-around';
      case 'evenly':
        return 'space-evenly';
      default:
        return 'flex-start';
    }
  }};
  flex-wrap: ${({ wrap }) => wrap};
  gap: ${({ gap }) => gap === 'none' ? '0' : spacing[gap as keyof typeof spacing]};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  margin: ${({ margin }) => margin === 'none' ? '0' : spacing[margin as keyof typeof spacing]};
  margin-top: ${({ marginTop }) => marginTop === 'none' ? '0' : spacing[marginTop as keyof typeof spacing]};
  margin-bottom: ${({ marginBottom }) => marginBottom === 'none' ? '0' : spacing[marginBottom as keyof typeof spacing]};

  /* Spacing between children */
  & > * + * {
    ${({ direction, spacing }) => {
      if (spacing === 'none') return '';
      const space = spacing[spacing as keyof typeof spacing];
      return direction === 'horizontal' 
        ? `margin-left: ${space};`
        : `margin-top: ${space};`;
    }}
  }
`;

const Stack: React.FC<StackProps> = ({ 
  direction = 'vertical', 
  spacing = 'md', 
  align = 'start', 
  justify = 'start',
  wrap = 'nowrap',
  gap = 'none',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  fullWidth = false,
  as: Component = 'div',
  children,
  id,
  ...rest
}) => {
  return (
    <StyledStack
      direction={direction}
      spacing={spacing}
      align={align}
      justify={justify}
      wrap={wrap}
      gap={gap}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      fullWidth={fullWidth}
      as={Component}
      id={id}
      {...rest}
    >
      {children}
    </StyledStack>
  );
};

// Layout component
interface LayoutProps {
  children: React.ReactNode;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  spacing = 'lg', 
  container = true, 
  maxWidth = '2xl' 
}) => {
  if (container) {
    return (
      <Container maxWidth={maxWidth}>
        <Stack direction="vertical" spacing={spacing}>
          {children}
        </Stack>
      </Container>
    );
  }

  return (
    <Stack direction="vertical" spacing={spacing}>
      {children}
    </Stack>
  );
};

// Spacer component
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis?: 'horizontal' | 'vertical';
}

const StyledSpacer = styled.div<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis: 'horizontal' | 'vertical';
}>`
  ${({ size, axis }) => {
    const space = spacing[size];
    return axis === 'horizontal' 
      ? `width: ${space}; height: 1px;`
      : `height: ${space}; width: 100%;`;
  }}
`;

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'md', 
  axis = 'vertical' 
}) => {
  return <StyledSpacer size={size} axis={axis} />;
};

// Margin Enforcer Component - Ensures consistent spacing
interface MarginEnforcerProps {
  children: React.ReactNode;
  type?: 'section' | 'component' | 'card' | 'form' | 'navigation';
  margin?: 'top' | 'bottom' | 'both';
}

const StyledMarginEnforcer = styled.div<{
  type: 'section' | 'component' | 'card' | 'form' | 'navigation';
  margin: 'top' | 'bottom' | 'both';
}>`
  ${({ type, margin }) => {
    const marginTokens = {
      section: {
        top: margins.section.top,
        bottom: margins.section.bottom,
        both: `${margins.section.top} 0 ${margins.section.bottom} 0`,
      },
      component: {
        top: margins.component.top,
        bottom: margins.component.bottom,
        both: `${margins.component.top} 0 ${margins.component.bottom} 0`,
      },
      card: {
        top: margins.card.top,
        bottom: margins.card.bottom,
        both: `${margins.card.top} 0 ${margins.card.bottom} 0`,
      },
      form: {
        top: margins.form.section,
        bottom: margins.form.section,
        both: `${margins.form.section} 0`,
      },
      navigation: {
        top: margins.navigation.group,
        bottom: margins.navigation.group,
        both: `${margins.navigation.group} 0`,
      },
    };

    return `margin: ${marginTokens[type][margin]};`;
  }}
`;

const MarginEnforcer: React.FC<MarginEnforcerProps> = ({ 
  children, 
  type = 'component',
  margin = 'both',
}) => {
  return (
    <StyledMarginEnforcer type={type} margin={margin}>
      {children}
    </StyledMarginEnforcer>
  );
};

interface PositionedContainerProps {
  children: React.ReactNode;
  position?: 'fixed' | 'absolute' | 'relative';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  display?: 'flex' | 'block' | 'inline' | 'inline-block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  as?: 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  id?: string;
}

const StyledPositionedContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['position', 'top', 'right', 'bottom', 'left', 'zIndex', 'display', 'flexDirection', 'alignItems', 'justifyContent'].includes(prop)
})<{
  position: 'fixed' | 'absolute' | 'relative';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  display: 'flex' | 'block' | 'inline' | 'inline-block';
  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
}>`
  position: ${({ position }) => position};
  ${({ top }) => top && `top: ${top};`}
  ${({ right }) => right && `right: ${right};`}
  ${({ bottom }) => bottom && `bottom: ${bottom};`}
  ${({ left }) => left && `left: ${left};`}
  ${({ zIndex }) => zIndex && `z-index: ${zIndex};`}
  display: ${({ display }) => display};
  ${({ display, flexDirection, alignItems, justifyContent }) => 
    display === 'flex' && `
      flex-direction: ${flexDirection};
      align-items: ${alignItems};
      justify-content: ${justifyContent};
    `
  }
`;

export const PositionedContainer: React.FC<PositionedContainerProps> = ({
  children,
  position = 'relative',
  top,
  right,
  bottom,
  left,
  zIndex,
  display = 'block',
  flexDirection = 'row',
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  as: Component = 'div',
  id,
  ...rest
}) => {
  return (
    <StyledPositionedContainer
      position={position}
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      zIndex={zIndex}
      display={display}
      flexDirection={flexDirection}
      alignItems={alignItems}
      justifyContent={justifyContent}
      as={Component}
      id={id}
      {...rest}
    >
      {children}
    </StyledPositionedContainer>
  );
};

export { MarginEnforcer, Section, Stack };
export { Box } from './Box'; 