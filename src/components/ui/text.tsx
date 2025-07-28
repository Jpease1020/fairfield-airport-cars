import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight, transitions } from '@/lib/design-system/tokens';

// Styled heading component
const StyledHeading = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'weight', 'align'].includes(prop)
})<{
  variant: 'default' | 'primary' | 'secondary' | 'muted' | 'accent';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align: 'left' | 'center' | 'right';
}>`
  margin: 0;
  line-height: 1.2;
  transition: ${transitions.default};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `font-size: ${fontSize.xs};`;
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      case 'xl':
        return `font-size: ${fontSize.xl};`;
      case '2xl':
        return `font-size: 1.5rem;`;
      case '3xl':
        return `font-size: 1.875rem;`;
      case '4xl':
        return `font-size: 2.25rem;`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Weight styles */
  ${({ weight }) => {
    switch (weight) {
      case 'light':
        return `font-weight: ${fontWeight.light};`;
      case 'normal':
        return `font-weight: ${fontWeight.normal};`;
      case 'medium':
        return `font-weight: ${fontWeight.medium};`;
      case 'semibold':
        return `font-weight: ${fontWeight.semibold};`;
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      case 'extrabold':
        return `font-weight: 800;`;
      default:
        return `font-weight: ${fontWeight.normal};`;
    }
  }}

  /* Align styles */
  ${({ align }) => {
    switch (align) {
      case 'left':
        return `text-align: left;`;
      case 'center':
        return `text-align: center;`;
      case 'right':
        return `text-align: right;`;
      default:
        return `text-align: left;`;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `color: ${colors.text.primary};`;
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.secondary};`;
      case 'accent':
        return `color: ${colors.primary[600]};`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}
`;

// Styled text component
const StyledText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'weight', 'align', 'color'].includes(prop)
})<{
  variant: 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align: 'left' | 'center' | 'right' | 'justify';
  color: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
}>`
  margin: 0;
  transition: ${transitions.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'body':
        return `line-height: 1.6;`;
      case 'lead':
        return `line-height: 1.6; font-weight: ${fontWeight.medium};`;
      case 'small':
        return `line-height: 1.4;`;
      case 'muted':
        return `line-height: 1.5;`;
      case 'caption':
        return `line-height: 1.4; text-transform: none;`;
      case 'overline':
        return `line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em;`;
      default:
        return `line-height: 1.6;`;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `font-size: ${fontSize.xs};`;
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      case 'xl':
        return `font-size: ${fontSize.xl};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Weight styles */
  ${({ weight }) => {
    switch (weight) {
      case 'light':
        return `font-weight: ${fontWeight.light};`;
      case 'normal':
        return `font-weight: ${fontWeight.normal};`;
      case 'medium':
        return `font-weight: ${fontWeight.medium};`;
      case 'semibold':
        return `font-weight: ${fontWeight.semibold};`;
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      default:
        return `font-weight: ${fontWeight.normal};`;
    }
  }}

  /* Align styles */
  ${({ align }) => {
    switch (align) {
      case 'left':
        return `text-align: left;`;
      case 'center':
        return `text-align: center;`;
      case 'right':
        return `text-align: right;`;
      case 'justify':
        return `text-align: justify;`;
      default:
        return `text-align: left;`;
    }
  }}

  /* Color styles */
  ${({ color }) => {
    switch (color) {
      case 'default':
        return `color: ${colors.text.primary};`;
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.muted};`;
      case 'success':
        return `color: ${colors.success[600]};`;
      case 'warning':
        return `color: ${colors.warning[600]};`;
      case 'error':
        return `color: ${colors.danger[600]};`;
      case 'info':
        return `color: ${colors.info[600]};`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}
`;

// Styled span component
const StyledSpan = styled.span.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'color', 'weight'].includes(prop)
})<{
  variant: 'default' | 'bold' | 'italic' | 'code' | 'mark' | 'link' | 'badge';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}>`
  transition: ${transitions.default};

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return '';
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      case 'italic':
        return `font-style: italic;`;
      case 'code':
        return `
          font-family: 'Courier New', monospace;
          background-color: ${colors.gray[100]};
          padding: ${spacing.xs} ${spacing.sm};
          border-radius: ${spacing.xs};
          font-size: 0.875em;
        `;
      case 'mark':
        return `
          background-color: ${colors.warning[200]};
          padding: ${spacing.xs};
        `;
      case 'link':
        return `
          color: ${colors.primary[600]};
          text-decoration: underline;
          cursor: pointer;
          
          &:hover {
            color: ${colors.primary[800]};
          }
        `;
      case 'badge':
        return `
          display: inline-block;
          padding: ${spacing.xs} ${spacing.sm};
          font-size: ${fontSize.xs};
          font-weight: ${fontWeight.medium};
          border-radius: ${spacing.xl};
          background-color: ${colors.gray[100]};
        `;
      default:
        return '';
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'xs':
        return `font-size: ${fontSize.xs};`;
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      case 'xl':
        return `font-size: ${fontSize.xl};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Color styles */
  ${({ color }) => {
    switch (color) {
      case 'default':
        return `color: ${colors.text.primary};`;
      case 'primary':
        return `color: ${colors.primary[600]};`;
      case 'secondary':
        return `color: ${colors.text.secondary};`;
      case 'muted':
        return `color: ${colors.text.muted};`;
      case 'success':
        return `color: ${colors.success[600]};`;
      case 'warning':
        return `color: ${colors.warning[600]};`;
      case 'error':
        return `color: ${colors.danger[600]};`;
      case 'info':
        return `color: ${colors.info[600]};`;
      default:
        return `color: ${colors.text.primary};`;
    }
  }}

  /* Weight styles */
  ${({ weight }) => {
    switch (weight) {
      case 'light':
        return `font-weight: ${fontWeight.light};`;
      case 'normal':
        return `font-weight: ${fontWeight.normal};`;
      case 'medium':
        return `font-weight: ${fontWeight.medium};`;
      case 'semibold':
        return `font-weight: ${fontWeight.semibold};`;
      case 'bold':
        return `font-weight: ${fontWeight.bold};`;
      default:
        return `font-weight: ${fontWeight.normal};`;
    }
  }}
`;

// Styled link component
const StyledLink = styled.a.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'external'].includes(prop)
})<{
  variant: 'primary' | 'secondary' | 'muted' | 'underline' | 'button';
  size: 'sm' | 'base' | 'lg';
  external: boolean;
}>`
  text-decoration: none;
  transition: ${transitions.default};
  cursor: pointer;

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          color: ${colors.primary[600]};
          
          &:hover {
            color: ${colors.primary[800]};
            text-decoration: underline;
          }
        `;
      case 'secondary':
        return `
          color: ${colors.text.secondary};
          
          &:hover {
            color: ${colors.text.primary};
            text-decoration: underline;
          }
        `;
      case 'muted':
        return `
          color: ${colors.text.muted};
          
          &:hover {
            color: ${colors.text.secondary};
            text-decoration: underline;
          }
        `;
      case 'underline':
        return `
          color: ${colors.primary[600]};
          text-decoration: underline;
          
          &:hover {
            color: ${colors.primary[800]};
          }
        `;
      case 'button':
        return `
          color: ${colors.primary[600]};
          font-weight: ${fontWeight.medium};
          
          &:hover {
            color: ${colors.primary[800]};
            text-decoration: underline;
          }
        `;
      default:
        return `
          color: ${colors.primary[600]};
          
          &:hover {
            color: ${colors.primary[800]};
            text-decoration: underline;
          }
        `;
    }
  }}

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'base':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Focus styles */
  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
  }
`;

// Heading Components
export interface HeadingProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  
  // HTML attributes
  id?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
  
  // Rest props
  [key: string]: any;
}

export const H1: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '4xl',
  weight = 'bold',
  align = 'left',
  id, 
  as: Component = 'h1',
  ...rest
}) => {
  return (
    <StyledHeading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </StyledHeading>
  );
};

export const H2: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '3xl',
  weight = 'bold',
  align = 'left',
  id, 
  as: Component = 'h2',
  ...rest
}) => {
  return (
    <StyledHeading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </StyledHeading>
  );
};

export const H3: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = '2xl',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h3',
  ...rest
}) => {
  return (
    <StyledHeading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </StyledHeading>
  );
};

export const H4: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'xl',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h4',
  ...rest
}) => {
  return (
    <StyledHeading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </StyledHeading>
  );
};

export const H5: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'lg',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h5',
  ...rest
}) => {
  return (
    <StyledHeading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </StyledHeading>
  );
};

export const H6: React.FC<HeadingProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  weight = 'semibold',
  align = 'left',
  id, 
  as: Component = 'h6',
  ...rest
}) => {
  return (
    <StyledHeading
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      id={id}
      {...rest}
    >
      {children}
    </StyledHeading>
  );
};

// Text Components
export interface TextProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  
  // HTML attributes
  as?: 'p' | 'span' | 'div' | 'article' | 'blockquote';
  
  // Rest props
  [key: string]: any;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size = 'md',
  weight = 'normal',
  align = 'left',
  color = 'default',
  as: Component = 'p',
  ...rest
}) => {
  return (
    <StyledText
      as={Component}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      color={color}
      {...rest}
    >
      {children}
    </StyledText>
  );
};

// Span Component
export interface SpanProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'bold' | 'italic' | 'code' | 'mark' | 'link' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  
  // Rest props
  [key: string]: any;
}

export const Span: React.FC<SpanProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  color = 'default',
  weight = 'normal',
  ...rest
}) => {
  return (
    <StyledSpan
      variant={variant}
      size={size}
      color={color}
      weight={weight}
      {...rest}
    >
      {children}
    </StyledSpan>
  );
};

// Paragraph Component
export interface ParagraphProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'body' | 'lead' | 'small' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  
  // Rest props
  [key: string]: any;
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  variant = 'body',
  size = 'md',
  align = 'left',
  color = 'default',
  weight = 'normal',
  ...rest
}) => {
  return (
    <StyledText
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      color={color}
      {...rest}
    >
      {children}
    </StyledText>
  );
};

// Link Component
export interface LinkProps {
  // Core props
  children: React.ReactNode;
  href: string;
  
  // Appearance
  variant?: 'primary' | 'secondary' | 'muted' | 'underline' | 'button';
  size?: 'sm' | 'base' | 'lg';
  
  // Behavior
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  external?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  target = '_self',
  rel,
  variant = 'primary',
  size = 'base',
  external = false,
  ...rest
}) => {
  const linkRel = external ? 'noopener noreferrer' : rel;

  return (
    <StyledLink
      href={href}
      target={target}
      rel={linkRel}
      variant={variant}
      size={size}
      external={external}
      {...rest}
    >
      {children}
    </StyledLink>
  );
}; 