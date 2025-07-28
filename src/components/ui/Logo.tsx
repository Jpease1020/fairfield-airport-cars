import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/ui';

interface LogoProps {
  alt?: string;
  width?: number;
  height?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
  priority?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  alt = 'Fairfield Airport Cars Logo',
  width,
  height,
  size = 'md',
  variant = 'default',
  priority = false
}) => {
  // Size mapping
  const sizeMap = {
    sm: { width: 120, height: 120 },
    md: { width: 180, height: 180 },
    lg: { width: 240, height: 240 },
    xl: { width: 360, height: 360 }
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
      default:
        return '/NewLogoNoBackground.svg';
    }
  };

  return (
    <Container variant="default">
      <Image
        src={getImageSrc()}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        priority={priority}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </Container>
  );
};

Logo.displayName = 'Logo';

export default Logo; 