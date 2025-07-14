import React from 'react';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', alt = 'Fairfield Airport Cars Logo', ...props }) => (
  <img
    src="/logo.svg"
    className={className}
    alt={alt}
    {...props}
  />
);

export default Logo; 