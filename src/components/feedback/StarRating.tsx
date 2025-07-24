import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';

interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ 
    className, 
    rating, 
    maxRating = 5, 
    size = 'md',
    interactive = false,
    onRatingChange,
    showValue = false,
    ...props 
  }, ref) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    const handleStarClick = (starValue: number) => {
      if (interactive && onRatingChange) {
        onRatingChange(starValue);
      }
    };

    const handleStarHover = (starValue: number) => {
      if (interactive) {
        setHoverRating(starValue);
      }
    };

    const handleMouseLeave = () => {
      if (interactive) {
        setHoverRating(0);
      }
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-1', className)}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoverRating || rating);
          
          return (
            <Button
              key={starValue}
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={!interactive}
              className={cn(
                'transition-colors duration-200',
                sizeClasses[size],
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
            >
              <svg
                className={cn(
                  'w-full h-full',
                  isFilled ? 'text-warning' : 'text-text-muted'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.24 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
              </svg>
            </Button>
          );
        })}
        {showValue && (
          <span className="ml-2 text-sm text-text-secondary">
            {rating}/{maxRating}
          </span>
        )}
      </div>
    );
  }
);
StarRating.displayName = 'StarRating';

export { StarRating }; 