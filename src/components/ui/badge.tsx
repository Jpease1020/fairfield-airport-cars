import React from 'react';

// Badge Component - BULLETPROOF TYPE SAFETY!
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'md'
}) => {
  const baseClasses = 'status-badge';
  const variantClasses = {
    default: 'status-badge-default',
    success: 'status-badge-success',
    warning: 'status-badge-warning',
    error: 'status-badge-error',
    info: 'status-badge-info',
    pending: 'status-badge-pending',
    confirmed: 'status-badge-confirmed',
    completed: 'status-badge-completed',
    cancelled: 'status-badge-cancelled',
  };
  const sizeClasses = {
    sm: 'status-badge-sm',
    md: 'status-badge-md',
    lg: 'status-badge-lg',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md', 
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded]
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
}; 