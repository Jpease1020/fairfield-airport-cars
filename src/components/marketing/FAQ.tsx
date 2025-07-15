import * as React from 'react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  variant?: 'default' | 'accordion' | 'simple';
}

const FAQ = React.forwardRef<HTMLDivElement, FAQProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    items, 
    variant = 'default',
    ...props 
  }, ref) => {
    const [openItems, setOpenItems] = React.useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
      const newOpenItems = new Set(openItems);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      setOpenItems(newOpenItems);
    };

    if (variant === 'accordion') {
      return (
        <div ref={ref} className={cn('space-y-4', className)} {...props}>
          {title && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-text-primary mb-2">{title}</h2>
              {subtitle && (
                <p className="text-lg text-text-secondary">{subtitle}</p>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-border-primary rounded-lg">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-bg-secondary transition-colors"
                >
                  <span className="font-medium text-text-primary">{item.question}</span>
                  <svg
                    className={cn(
                      'w-5 h-5 text-text-secondary transition-transform',
                      openItems.has(index) ? 'rotate-180' : ''
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openItems.has(index) && (
                  <div className="px-6 pb-4">
                    <p className="text-text-secondary leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (variant === 'simple') {
      return (
        <div ref={ref} className={cn('space-y-6', className)} {...props}>
          {title && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-text-primary mb-2">{title}</h2>
              {subtitle && (
                <p className="text-lg text-text-secondary">{subtitle}</p>
              )}
            </div>
          )}
          
          <div className="space-y-8">
            {items.map((item, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {item.question}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default variant
    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">{title}</h2>
            {subtitle && (
              <p className="text-lg text-text-secondary">{subtitle}</p>
            )}
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <div key={index} className="bg-bg-primary border border-border-primary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                {item.question}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
FAQ.displayName = 'FAQ';

export { FAQ }; 