'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from './button';

interface HelpTooltipProps {
  content: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  className,
  size = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'inline-flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors',
          className
        )}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        <HelpCircle className={sizeClasses[size]} />
      </Button>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 text-sm text-text-inverse bg-bg-inverse rounded-lg shadow-lg -top-2 left-8 transform -translate-y-full">
          {content}
          <div className="absolute top-2 -left-1 w-2 h-2 bg-bg-inverse transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export { HelpTooltip }; 