import React from 'react';
import { Star } from 'lucide-react';
import { Stack } from '@/components/ui/containers';

interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

export const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(({
  rating,
  onRatingChange,
  maxRating = 5,
  className,
  ...props
}, ref) => {
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

  return (
    <Stack direction="horizontal" align="center" spacing="sm" className={className} onMouseLeave={handleMouseLeave} {...props}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);
        
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            disabled={!onRatingChange}
          >
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.24 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
            </svg>
          </button>
        );
      })}
      {onRatingChange && (
        <span>
          {rating}/{maxRating}
        </span>
      )}
    </Stack>
  );
});
StarRating.displayName = 'StarRating';

 