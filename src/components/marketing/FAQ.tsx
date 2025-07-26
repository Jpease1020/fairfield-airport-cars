import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';

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
            <div className="">
              <h2 className="">{title}</h2>
              {subtitle && (
                <p className="">{subtitle}</p>
              )}
            </div>
          )}
          
          <div className="">
            {items.map((item, index) => (
              <div key={index} className="">
                <Button
                  variant="ghost"
                  onClick={() => toggleItem(index)}
                  className=""
                >
                  <span className="">{item.question}</span>
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
                </Button>
                
                {openItems.has(index) && (
                  <div className="">
                    <p className="">{item.answer}</p>
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
            <div className="">
              <h2 className="">{title}</h2>
              {subtitle && (
                <p className="">{subtitle}</p>
              )}
            </div>
          )}
          
          <div className="">
            {items.map((item, index) => (
              <div key={index}>
                <h3 className="">
                  {item.question}
                </h3>
                <p className="">
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
          <div className="">
            <h2 className="">{title}</h2>
            {subtitle && (
              <p className="">{subtitle}</p>
            )}
          </div>
        )}
        
        <div className="">
          {items.map((item, index) => (
            <div key={index} className="">
              <h3 className="">
                {item.question}
              </h3>
              <p className="">
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