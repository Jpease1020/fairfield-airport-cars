import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';

const StyledImage = styled(Image)`
  max-width: 100%;
  height: auto;
`;

export interface WindowIconProps {
  alt?: string;
  width?: number;
  height?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

const WindowIcon: React.FC<WindowIconProps> = ({ 
  alt = 'Window Icon',
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
      src="/window.svg"
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      priority={priority}
    />
  );
};

WindowIcon.displayName = 'WindowIcon';

export default WindowIcon; 