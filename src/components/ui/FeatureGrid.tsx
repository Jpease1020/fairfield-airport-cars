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
  return (
    <div className={className}>
      {features.map((feature, index) => (
        <div key={feature.id || index}>
          <div>
            {feature.icon}
          </div>
          <h4>
            {feature.title}
          </h4>
          <p>
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid; 