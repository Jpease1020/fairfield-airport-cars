import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  alt = 'Fairfield Airport Cars Logo',
  width = 260,
  height = 260,
  ...props 
}) => (
  <Image
    src="/NewLogoNoBackground.svg"
    alt={alt}
    width={width}
    height={height}
    className={`max-h-40 w-auto ${className}`}
    {...props}
  />
);

export default Logo; 