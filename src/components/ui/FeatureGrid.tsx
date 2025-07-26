import React from 'react';

interface Feature {
  id?: string | number;
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * FeatureGrid - A reusable component for displaying feature cards in a grid
 * 
 * @example
 * ```tsx
 * const features = [
 *   { icon: "⏰", title: "On Time", description: "Reliable pickup times" },
 *   { icon: "🚗", title: "Clean Cars", description: "Well-maintained vehicles" },
 *   { icon: "💳", title: "Easy Payment", description: "Secure online booking" }
 * ];
 * 
 * <FeatureGrid features={features} columns={3} />
 * ```
 */
export const FeatureGrid: React.FC<FeatureGridProps> = ({ 
  features, 
  columns = 3, 
  className = '' 
}) => {
  const gridClass = [
    'feature-grid',
    `feature-grid-${columns}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClass}>
      {features.map((feature, index) => (
        <div 
          key={feature.id || index}
          className="feature-item"
        >
          <div className="feature-icon">
            {feature.icon}
          </div>
          <h4 className="feature-title">
            {feature.title}
          </h4>
          <p className="feature-description">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid; 