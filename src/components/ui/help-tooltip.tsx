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
    <div className="">
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
        <div className="">
          {content}
          <div className=""></div>
        </div>
      )}
    </div>
  );
};

export { HelpTooltip }; 