import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';

const StyledImage = styled(Image)`
  max-width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center;
`;

export interface LogoProps {
  alt?: string;
  width?: number;
  height?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'white' | 'dark' | 'no-background';
  priority?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  alt = 'Fairfield Airport Cars Logo',
  width,
  height,
  size = 'md',
  variant = 'default',
  priority = false,
  className
}) => {
  // Size mapping
  const sizeMap = {
    xs: { width: 60, height: 60 },
    sm: { width: 120, height: 120 },
    md: { width: 180, height: 180 },
    lg: { width: 240, height: 240 },
    xl: { width: 360, height: 360 },
    '2xl': { width: 480, height: 480 }
  };

  // Use provided dimensions or size-based dimensions
  const finalWidth = width || sizeMap[size].width;
  const finalHeight = height || sizeMap[size].height;

  // Variant-based image source
  const getImageSrc = () => {
    switch (variant) {
      case 'white':
        return '/NewLogoWhite.svg';
      case 'dark':
        return '/NewLogoDark.svg';
      case 'no-background':
        return '/NewLogoNoBackground.svg';
      default:
        return '/NewLogoNoBackground.svg'; // Use no-background version by default
    }
  };

  return (
    <StyledImage
      src={getImageSrc()}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      priority={priority}
      className={className}
    />
  );
};

Logo.displayName = 'Logo';

export default Logo; 