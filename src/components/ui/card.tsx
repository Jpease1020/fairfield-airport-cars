import React from 'react';
import { Container, H3, Text } from '@/components/ui';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  hoverable = false,
}) => {
  const baseClasses = 'info-card';
  const variantClasses = {
    default: 'info-card-default',
    outlined: 'info-card-outlined',
    elevated: 'info-card-elevated',
    light: 'info-card-light',
    dark: 'info-card-dark',
  };
  const sizeClasses = {
    sm: 'info-card-sm',
    md: 'info-card-md',
    lg: 'info-card-lg',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    hoverable ? 'info-card-hoverable' : '',
    onClick ? 'info-card-clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <H3>
      {children}
    </H3>
  );
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  return (
    <Text>
      {children}
    </Text>
  );
}; 