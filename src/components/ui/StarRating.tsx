import React from 'react';
import { Star } from 'lucide-react';
import { Stack, Container } from '@/components/ui/containers';
import { Span } from '@/components/ui';

// Clean StarRating Component - No className Props Allowed!
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'compact' | 'large';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  spacing = 'sm',
  variant = 'default',
  showValue = false
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleStarClick = (starValue: number) => {
    if (onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (onRatingChange) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (onRatingChange) {
      setHoverRating(0);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  return (
    <Stack 
      direction="horizontal" 
      align="center" 
      spacing={spacing}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);
        
        return (
          <button
            key={starValue}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            className={`${onRatingChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
            disabled={!onRatingChange}
          >
            <Star
              className={sizeClasses[size]}
              fill="currentColor"
            />
          </button>
        );
      })}
      {showValue && (
        <Span color="muted" size="sm">
          {rating}/{maxRating}
        </Span>
      )}
    </Stack>
  );
});
StarRating.displayName = 'StarRating';

 