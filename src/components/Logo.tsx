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
  width = 360,
  height = 360,
  ...props 
}) => (
  <Image
    src="/NewLogoNoBackground.svg"
    alt={alt}
    width={width}
    height={height}
    className={className}
    {...props}
  />
);

export default Logo; 