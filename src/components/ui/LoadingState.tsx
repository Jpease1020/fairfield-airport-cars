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
      <div className="text-center">
        {showSpinner && (
          <div className="mb-4">
            <LoadingSpinner />
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
        )}
        {message && (
          <p className="text-xs text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
}; 