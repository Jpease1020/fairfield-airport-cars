import React from 'react';
import { LoadingSpinner } from '@/components/data';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  message?: string;
  showSpinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  subtitle,
  message,
  showSpinner = true,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    'sm': 'h-32',
    'md': 'h-64',
    'lg': 'h-96'
  }[size];

  return (
    <div className={`flex items-center justify-center ${sizeClasses} ${className}`}>
      <div className="">
        {showSpinner && (
          <div className="">
            <LoadingSpinner />
          </div>
        )}
        <h3 className="">{title}</h3>
        {subtitle && (
          <p className="">{subtitle}</p>
        )}
        {message && (
          <p className="">{message}</p>
        )}
      </div>
    </div>
  );
}; 