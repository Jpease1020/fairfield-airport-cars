import React from 'react';
import { Star } from 'lucide-react';
import { Stack, Container } from '@/components/ui/containers';
import { Span } from '@/components/ui';

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
          <Container
            key={starValue}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            style={{ cursor: onRatingChange ? 'pointer' : 'default' }}
          >
            <Star
              fill="currentColor"
              viewBox="0 0 20 20"
            />
          </Container>
        );
      })}
      {onRatingChange && (
        <Span>
          {rating}/{maxRating}
        </Span>
      )}
    </Stack>
  );
});
StarRating.displayName = 'StarRating';

 