import React from 'react';

// Heading Components
export interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const H1: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h1 id={id} className={`heading heading-1 ${className}`}>
      {children}
    </h1>
  );
};

export const H2: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h2 id={id} className={`heading heading-2 ${className}`}>
      {children}
    </h2>
  );
};

export const H3: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h3 id={id} className={`heading heading-3 ${className}`}>
      {children}
    </h3>
  );
};

export const H4: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h4 id={id} className={`heading heading-4 ${className}`}>
      {children}
    </h4>
  );
};

export const H5: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h5 id={id} className={`heading heading-5 ${className}`}>
      {children}
    </h5>
  );
};

export const H6: React.FC<HeadingProps> = ({ children, className = '', id }) => {
  return (
    <h6 id={id} className={`heading heading-6 ${className}`}>
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
  variant = 'body',
  size = 'base',
  align = 'left',
  color = 'primary',
}) => {
  const classes = [
    'text',
    `text-${variant}`,
    `text-size-${size}`,
    `text-align-${align}`,
    `text-color-${color}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
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
    <span 
      className={`text ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
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
  const classes = [
    'container',
    fluid ? 'container-fluid' : `container-max-width-${maxWidth}`,
    padding !== 'none' ? `container-padding-${padding}` : '',
    center ? 'container-center' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
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
  variant = 'default',
  background = 'default',
}) => {
  const classes = [
    'section',
    `section-${variant}`,
    `section-background-${background}`,
    padding !== 'none' ? `section-padding-${padding}` : '',
    margin !== 'none' ? `section-margin-${margin}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      {children}
    </section>
  );
}; 