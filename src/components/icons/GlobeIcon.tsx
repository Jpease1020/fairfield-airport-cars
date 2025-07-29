import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';

const StyledImage = styled(Image)`
  max-width: 100%;
  height: auto;
`;

export interface GlobeIconProps {
  alt?: string;
  width?: number;
  height?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

const GlobeIcon: React.FC<GlobeIconProps> = ({ 
  alt = 'Globe Icon',
  width,
  height,
  size = 'md',
  priority = false
}) => {
  // Size mapping
  const sizeMap = {
    xs: { width: 16, height: 16 },
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 }
  };

  // Use provided dimensions or size-based dimensions
  const finalWidth = width || sizeMap[size].width;
  const finalHeight = height || sizeMap[size].height;

  return (
    <StyledImage
      src="/globe.svg"
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      priority={priority}
    />
  );
};

GlobeIcon.displayName = 'GlobeIcon';

export default GlobeIcon; 