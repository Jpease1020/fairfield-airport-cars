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
    <div >
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors p-2',
          className
        )}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        <HelpCircle className={sizeClasses[size]} />
      </button>
      
      {isVisible && (
        <div >
          {content}
          <div ></div>
        </div>
      )}
    </div>
  );
};

export { HelpTooltip }; 