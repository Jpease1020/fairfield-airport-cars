import React from 'react';
import { Container, H3, Text } from '@/components/ui';

// OLD Card Component - DEPRECATED! Use bulletproof Card from containers instead!
export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

// Card Sub-components - BULLETPROOF TYPE SAFETY!
export interface CardHeaderProps {
  children: React.ReactNode;
  variant?: 'default' | 'centered' | 'minimal';
  spacing?: 'sm' | 'md' | 'lg';
}

export interface CardBodyProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardTitleProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'prominent' | 'subtle';
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'muted' | 'secondary';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
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
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({ children }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
  return (
    <H3>
      {children}
    </H3>
  );
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => {
  return (
    <Text>
      {children}
    </Text>
  );
}; 