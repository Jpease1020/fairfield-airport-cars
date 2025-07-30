import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';

const StyledImage = styled(Image)`
  max-width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center;
`;

export interface IconProps {
  type: 'file' | 'globe' | 'window' | 'logo';
  alt?: string;
  width?: number;
  height?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

const Icon: React.FC<IconProps> = ({ 
  type,
  alt,
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

  // Icon mapping
  const iconMap = {
    file: { src: '/file.svg', defaultAlt: 'File Icon' },
    globe: { src: '/globe.svg', defaultAlt: 'Globe Icon' },
    window: { src: '/window.svg', defaultAlt: 'Window Icon' },
    logo: { src: '/logo.svg', defaultAlt: 'Logo' }
  };

  // Use provided dimensions or size-based dimensions
  const finalWidth = width || sizeMap[size].width;
  const finalHeight = height || sizeMap[size].height;
  const iconConfig = iconMap[type];

  return (
    <StyledImage
      src={iconConfig.src}
      alt={alt || iconConfig.defaultAlt}
      width={finalWidth}
      height={finalHeight}
      priority={priority}
    />
  );
};

Icon.displayName = 'Icon';

export default Icon; 