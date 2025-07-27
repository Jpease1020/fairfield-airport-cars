import React from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  backgroundImage?: string;
  variant?: 'default' | 'centered';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  variant = 'default'
}) => {
  const contentClasses = `hero-content ${variant === 'centered' ? 'hero-content-centered' : ''}`;

  return (
    <div className="hero-section">
      {backgroundImage && (
        <div 
          className="hero-background"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="hero-background-overlay" />
        </div>
      )}
      
      <div className={contentClasses}>
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {description && <p className="hero-description">{description}</p>}
        
        {(primaryAction || secondaryAction) && (
          <div className="hero-actions">
            {primaryAction && (
              <a 
                href={primaryAction.href}
                className="hero-primary-action"
              >
                {primaryAction.label}
              </a>
            )}
            
            {secondaryAction && (
              <a 
                href={secondaryAction.href}
                className="hero-secondary-action"
              >
                {secondaryAction.label} <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};