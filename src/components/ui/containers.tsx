import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';

// Styled container component
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

  /* Spacing styles */
  ${({ spacing }) => {
    switch (spacing) {
      case 'none':
        return `& > * + * { margin-top: 0; }`;
      case 'xs':
        return `& > * + * { margin-top: ${spacing.xs}; }`;
      case 'sm':
        return `& > * + * { margin-top: ${spacing.sm}; }`;
      case 'md':
        return `& > * + * { margin-top: ${spacing.md}; }`;
      case 'lg':
        return `& > * + * { margin-top: ${spacing.lg}; }`;
      case 'xl':
        return `& > * + * { margin-top: ${spacing.xl}; }`;
      case '2xl':
        return `& > * + * { margin-top: ${spacing['2xl']}; }`;
      default:
        return `& > * + * { margin-top: 0; }`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `display: block;`;
      case 'card':
        return `
          background-color: ${colors.background.primary};
          border-radius: ${borderRadius.lg};
          border: 1px solid ${colors.border.light};
          box-shadow: ${shadows.sm};
        `;
      case 'section':
        return `width: 100%;`;
      case 'main':
        return `flex: 1; min-height: 0;`;
      case 'content':
        return `flex: 1;`;
      case 'navigation':
        return `
          background-color: ${colors.background.primary};
          border-bottom: 1px solid ${colors.border.light};
        `;
      case 'tooltip':
        return `
          background-color: ${colors.gray[900]};
          color: ${colors.text.white};
          font-size: 0.875rem;
          border-radius: ${borderRadius.default};
          padding: ${spacing.xs} ${spacing.sm};
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          border-radius: ${borderRadius.lg};
          box-shadow: ${shadows.md};
          border: 1px solid ${colors.border.light};
        `;
      default:
        return `display: block;`;
    }
  }}
`;

export interface ContainerProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // Spacing
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // HTML attributes
  as?: 'div' | 'main' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer';
  
  // Rest props
  [key: string]: any;
}

export const Container: React.FC<ContainerProps> = ({ 
  // Core props
  children,
  
  // Appearance
  variant = 'default',
  maxWidth = 'xl', 
  padding = 'md', 
  
  // Spacing
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  spacing = 'none',
  
  // HTML attributes
  as: Component = 'div',
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledContainer
      as={Component}
      variant={variant}
      maxWidth={maxWidth}
      padding={padding}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      spacing={spacing}
      {...rest}
    >
      {children}
    </StyledContainer>
  );
};

Container.displayName = 'Container';

// Styled box component
const StyledBox = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'padding', 'rounded', 'margin', 'marginTop', 'marginBottom'].includes(prop)
})<{
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  padding: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}>`
  transition: ${transitions.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `background-color: ${colors.background.primary};`;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          box-shadow: ${shadows.lg};
        `;
      case 'outlined':
        return `
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.border.default};
        `;
      case 'filled':
        return `background-color: ${colors.background.secondary};`;
      default:
        return `background-color: ${colors.background.primary};`;
    }
  }}

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

  /* Rounded styles */
  ${({ rounded }) => {
    switch (rounded) {
      case 'none':
        return `border-radius: 0;`;
      case 'sm':
        return `border-radius: ${borderRadius.sm};`;
      case 'md':
        return `border-radius: ${borderRadius.md};`;
      case 'lg':
        return `border-radius: ${borderRadius.lg};`;
      case 'xl':
        return `border-radius: ${borderRadius.xl};`;
      case 'full':
        return `border-radius: ${borderRadius.pill};`;
      default:
        return `border-radius: ${borderRadius.md};`;
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
`;

export interface BoxProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Spacing
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // HTML attributes
  as?: 'div' | 'section' | 'article' | 'aside';
  
  // Rest props
  [key: string]: any;
}

export const Box: React.FC<BoxProps> = ({ 
  // Core props
  children,
  
  // Appearance
  variant = 'default', 
  padding = 'md', 
  rounded = 'md',
  
  // Spacing
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  
  // HTML attributes
  as: Component = 'div',
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledBox
      as={Component}
      variant={variant}
      padding={padding}
      rounded={rounded}
      margin={margin}
      marginTop={marginTop}
      marginBottom={marginBottom}
      {...rest}
    >
      {children}
    </StyledBox>
  );
};

Box.displayName = 'Box';

// Section Component - Clean Reusable Component (No className!)
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
}

const Section: React.FC<SectionProps> = ({ 
  variant = 'default', 
  padding = 'lg', 
  container = true, 
  maxWidth = 'xl',
  margin = 'none',
  marginTop = 'none',
  marginBottom = 'none',
  fullWidth = false,
  as: Component = 'section',
  children
}) => {
  const variantClasses = {
    default: 'bg-white',
    alternate: 'bg-gray-50',
    brand: 'bg-blue-600 text-white',
    muted: 'bg-gray-100',
    hero: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
    cta: 'bg-green-500 text-white'
  };

  const paddingClasses = {
    none: '',
    xs: 'py-4',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20',
    '2xl': 'py-24'
  };

  const marginClasses = {
    none: '',
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
    '2xl': 'm-12'
  };

  const marginTopClasses = {
    none: '',
    xs: 'mt-1',
    sm: 'mt-2',
    md: 'mt-4',
    lg: 'mt-6',
    xl: 'mt-8',
    '2xl': 'mt-12'
  };

  const marginBottomClasses = {
    none: '',
    xs: 'mb-1',
    sm: 'mb-2',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
    '2xl': 'mb-12'
  };

  const content = container ? (
    <Container maxWidth={maxWidth} padding="none">
      {children}
    </Container>
  ) : children;

  return (
    <Component
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        marginClasses[margin],
        marginTopClasses[marginTop],
        marginBottomClasses[marginBottom],
        fullWidth && 'w-full'
      )}
    >
      {content}
    </Component>
  );
};
Section.displayName = 'Section';

// Card Component - BULLETPROOF TYPE SAFETY!
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  as?: 'div' | 'article' | 'section';
}

const Card: React.FC<CardProps> = ({ 
    variant = 'default', 
    padding = 'md', 
    hover = false,
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    as: Component = 'div',
    children
  }) => {
    const variantClasses = {
      default: 'bg-bg-primary border border-border-primary',
      elevated: 'bg-bg-primary shadow-lg',
      outlined: 'bg-bg-primary border-2 border-border-primary',
      filled: 'bg-bg-secondary'
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12'
    };

    const marginClasses = {
      none: '',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      '2xl': 'm-12'
    };

    const marginTopClasses = {
      none: '',
      xs: 'mt-1',
      sm: 'mt-2',
      md: 'mt-4',
      lg: 'mt-6',
      xl: 'mt-8',
      '2xl': 'mt-12'
    };

    const marginBottomClasses = {
      none: '',
      xs: 'mb-1',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
      '2xl': 'mb-12'
    };

    return (
      <Component
        className={cn(
          'rounded-lg transition-all duration-200',
          variantClasses[variant],
          paddingClasses[padding],
          marginClasses[margin],
          marginTopClasses[marginTop],
          marginBottomClasses[marginBottom],
          hover && 'hover:shadow-md hover:-translate-y-1'
        )}
      >
        {children}
      </Component>
    );
  };
Card.displayName = 'Card';

// Stack Component for consistent spacing - Clean Reusable Component (No className!)
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
}

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
  children
}) => {
  const directionClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col'
  };

  const spacingClasses = {
    none: '',
    xs: direction === 'vertical' ? 'space-y-1' : 'space-x-1',
    sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    xl: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
    '2xl': direction === 'vertical' ? 'space-y-12' : 'space-x-12'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const wrapClasses = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const gapClasses = {
    none: '',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12'
  };

  const marginClasses = {
    none: '',
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
    '2xl': 'm-12'
  };

  const marginTopClasses = {
    none: '',
    xs: 'mt-1',
    sm: 'mt-2',
    md: 'mt-4',
    lg: 'mt-6',
    xl: 'mt-8',
    '2xl': 'mt-12'
  };

  const marginBottomClasses = {
    none: '',
    xs: 'mb-1',
    sm: 'mb-2',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
    '2xl': 'mb-12'
  };

  return (
    <Component
      className={cn(
        directionClasses[direction],
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        wrapClasses[wrap],
        gapClasses[gap],
        marginClasses[margin],
        marginTopClasses[marginTop],
        marginBottomClasses[marginBottom],
        fullWidth && 'w-full'
      )}
    >
      {children}
    </Component>
  );
};
Stack.displayName = 'Stack';

// Grid Component - BULLETPROOF TYPE SAFETY!
interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  as?: 'div' | 'section' | 'article';
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(({ 
    cols = 1, 
    gap = 'md', 
    responsive = true,
    margin = 'none',
    marginTop = 'none',
    marginBottom = 'none',
    as: Component = 'div',
    children,
    ...props
  }, ref) => {
    const colsClasses = {
      1: 'grid-cols-1',
      2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
      3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
      4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
      5: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' : 'grid-cols-5',
      6: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6' : 'grid-cols-6',
      12: responsive ? 'grid-cols-1 md:grid-cols-6 lg:grid-cols-12' : 'grid-cols-12'
    };

    const gapClasses = {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };

    const marginClasses = {
      none: '',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      '2xl': 'm-12'
    };

    const marginTopClasses = {
      none: '',
      xs: 'mt-1',
      sm: 'mt-2',
      md: 'mt-4',
      lg: 'mt-6',
      xl: 'mt-8',
      '2xl': 'mt-12'
    };

    const marginBottomClasses = {
      none: '',
      xs: 'mb-1',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
      '2xl': 'mb-12'
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'grid',
          colsClasses[cols],
          gapClasses[gap],
          marginClasses[margin],
          marginTopClasses[marginTop],
          marginBottomClasses[marginBottom]
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Grid.displayName = 'Grid';

// Layout Components for Page-Level Spacing
// Layout Component - BULLETPROOF TYPE SAFETY!
interface LayoutProps {
  children: React.ReactNode;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ 
    spacing = 'md', 
    container = true, 
    maxWidth = 'xl',
    children, 
    ...props 
  }, ref) => {
    const spacingClasses = {
      none: '',
      xs: 'space-y-1',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8',
      '2xl': 'space-y-12'
    };

    const content = container ? (
      <Container maxWidth={maxWidth} padding="none">
        {children}
      </Container>
    ) : children;

    return (
      <div
        ref={ref}
        className={cn(
          spacingClasses[spacing]
        )}
        {...props}
      >
        {content}
      </div>
    );
  }
);
Layout.displayName = 'Layout';

// Spacer Component - BULLETPROOF TYPE SAFETY!
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  axis?: 'horizontal' | 'vertical';
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ size = 'md', axis = 'vertical', ...props }, ref) => {
    const sizeClasses = {
      xs: axis === 'vertical' ? 'h-1' : 'w-1',
      sm: axis === 'vertical' ? 'h-2' : 'w-2',
      md: axis === 'vertical' ? 'h-4' : 'w-4',
      lg: axis === 'vertical' ? 'h-6' : 'w-6',
      xl: axis === 'vertical' ? 'h-8' : 'w-8',
      '2xl': axis === 'vertical' ? 'h-12' : 'w-12'
    };

    return (
      <div
        ref={ref}
        className={cn(sizeClasses[size])}
        {...props}
      />
    );
  }
);
Spacer.displayName = 'Spacer';

export {
  Container,
  Box,
  Section,
  Card,
  Stack,
  Grid,
  Layout,
  Spacer
}; 