import React from 'react';

// Heading Components
export interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const H1: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h1 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-4xl)', fontWeight: 'bold' }} className={className}>
      {children}
    </h1>
  );
};

export const H2: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h2 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-3xl)', fontWeight: 'bold' }} className={className}>
      {children}
    </h2>
  );
};

export const H3: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h3 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-2xl)', fontWeight: '600' }} className={className}>
      {children}
    </h3>
  );
};

export const H4: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h4 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-xl)', fontWeight: '600' }} className={className}>
      {children}
    </h4>
  );
};

export const H5: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h5 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-lg)', fontWeight: '600' }} className={className}>
      {children}
    </h5>
  );
};

export const H6: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h6 id={id} style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-base)', fontWeight: '600' }} className={className}>
      {children}
    </h6>
  );
};

// Text Components
export interface TextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'strong' | 'em' | 'code' | 'mark';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
}

export const Text: React.FC<TextProps> = ({
  children,
  className = '',
  size = 'base',
  align = 'left',
}) => {
  const sizeStyles = {
    xs: { fontSize: 'var(--font-size-xs)' },
    sm: { fontSize: 'var(--font-size-sm)' },
    base: { fontSize: 'var(--font-size-base)' },
    lg: { fontSize: 'var(--font-size-lg)' },
    xl: { fontSize: 'var(--font-size-xl)' }
  };

  const alignStyles = {
    left: { textAlign: 'left' as const },
    center: { textAlign: 'center' as const },
    right: { textAlign: 'right' as const },
    justify: { textAlign: 'justify' as const }
  };

  const style: React.CSSProperties = {
    color: 'var(--text-primary)',
    ...sizeStyles[size],
    ...alignStyles[align]
  };

  return (
    <Span>
      {children}
    </Span>
  );
};

export const Span: React.FC<TextProps> = ({ 
  children, 
  variant = 'body', 
  className = '', 
  ...props 
}) => {
  const variantClasses = {
    body: 'text-body',
    lead: 'text-lead',
    small: 'text-small',
    muted: 'text-muted',
    strong: 'text-strong',
    em: 'text-em',
    code: 'text-code',
    mark: 'text-mark'
  };

  return (
    <Span>
      {children}
    </Span>
  );
};

export interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'lead' | 'small' | 'muted';
  size?: 'sm' | 'base' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  className = '',
  variant = 'body',
  size = 'base',
  align = 'left',
  color = 'primary',
}) => {
  const classes = [
    'paragraph',
    `paragraph-${variant}`,
    `paragraph-size-${size}`,
    `paragraph-align-${align}`,
    `paragraph-color-${color}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <p className={classes}>
      {children}
    </p>
  );
};

export interface LeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'primary' | 'secondary' | 'muted';
}

export const Lead: React.FC<LeadProps> = ({
  children,
  className = '',
  align = 'left',
  color = 'primary',
}) => {
  const classes = [
    'lead',
    `lead-align-${align}`,
    `lead-color-${color}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <p className={classes}>
      {children}
    </p>
  );
};

// Link Component
export interface LinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  variant?: 'primary' | 'secondary' | 'muted' | 'underline' | 'button';
  size?: 'sm' | 'base' | 'lg';
  external?: boolean;
}

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  className = '',
  target = '_self',
  rel,
  variant = 'primary',
  size = 'base',
  external = false,
}) => {
  const classes = [
    'link',
    `link-${variant}`,
    `link-size-${size}`,
    external ? 'link-external' : '',
    className,
  ].filter(Boolean).join(' ');

  const linkRel = external ? 'noopener noreferrer' : rel;

  return (
    <a
      href={href}
      target={target}
      rel={linkRel}
      className={classes}
    >
      {children}
      {external && <span className="link-external-icon">↗</span>}
    </a>
  );
};

// Container Component
export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  fluid?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = 'lg',
  center = true,
  fluid = false,
}) => {
  const maxWidthStyles = {
    sm: { maxWidth: '24rem' },
    md: { maxWidth: '28rem' },
    lg: { maxWidth: '32rem' },
    xl: { maxWidth: '36rem' },
    '2xl': { maxWidth: '42rem' },
    full: { maxWidth: '100%' }
  };

  const paddingStyles = {
    none: { padding: 0 },
    sm: { padding: 'var(--spacing-sm)' },
    md: { padding: 'var(--spacing-md)' },
    lg: { padding: 'var(--spacing-lg)' },
    xl: { padding: 'var(--spacing-xl)' }
  };

  const style: React.CSSProperties = {
    ...(center ? { margin: '0 auto' } : {}),
    ...(!fluid ? maxWidthStyles[maxWidth] : {}),
    ...paddingStyles[padding]
  };

  return (
    <Container>
      {children}
    </Container>
  );
};

// Section Component
export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'muted' | 'primary' | 'secondary';
  background?: 'default' | 'muted' | 'primary' | 'secondary';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  padding = 'lg',
  margin = 'none',
}) => {
  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: 'var(--spacing-lg) 0' },
    md: { padding: 'var(--spacing-xl) 0' },
    lg: { padding: 'var(--spacing-2xl) 0' },
    xl: { padding: 'var(--spacing-3xl) 0' }
  };

  const marginStyles = {
    none: { margin: '0' },
    sm: { margin: 'var(--spacing-lg) 0' },
    md: { margin: 'var(--spacing-xl) 0' },
    lg: { margin: 'var(--spacing-2xl) 0' },
    xl: { margin: 'var(--spacing-3xl) 0' }
  };

  const style: React.CSSProperties = {
    ...paddingStyles[padding],
    ...marginStyles[margin]
  };

  return (
    <section style={style} className={className}>
      {children}
    </section>
  );
}; 