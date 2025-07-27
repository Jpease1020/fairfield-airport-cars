import React from 'react';
import Image from 'next/image';

// Logo Component - BULLETPROOF TYPE SAFETY!
interface LogoProps {
  alt?: string;
  width?: number;
  height?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ 
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
    {...props}
  />
);

export default Logo; 