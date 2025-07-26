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
    <div 
      className={`feature-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${columns === 2 ? '300px' : columns === 3 ? '250px' : '200px'}, 1fr))`,
        gap: 'var(--spacing-lg)',
        padding: 'var(--spacing-lg) 0'
      }}
    >
      {features.map((feature, index) => (
        <div 
          key={feature.id || index}
          className="feature-item"
          style={{ 
            textAlign: 'center',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--background-secondary)',
            border: '1px solid var(--border-color)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            fontSize: '2rem', 
            marginBottom: 'var(--spacing-sm)',
            lineHeight: '1'
          }}>
            {feature.icon}
          </div>
          <h4 style={{ 
            margin: '0 0 var(--spacing-sm) 0',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600'
          }}>
            {feature.title}
          </h4>
          <p style={{ 
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: '1.5'
          }}>
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid; 