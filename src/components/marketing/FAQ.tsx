import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Section, Container, H2, H3, Text } from '@/components/ui';

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
        <Section className={cn('space-y-4', className)} {...props}>
          <Container maxWidth="lg">
            {title && (
              <div className="">
                <H2 className="">{title}</H2>
                {subtitle && (
                  <Text className="">{subtitle}</Text>
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
                      <Text className="">{item.answer}</Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      );
    }

    if (variant === 'simple') {
      return (
        <Section className={cn('space-y-6', className)} {...props}>
          <Container maxWidth="lg">
            {title && (
              <div className="">
                <H2 className="">{title}</H2>
                {subtitle && (
                  <Text className="">{subtitle}</Text>
                )}
              </div>
            )}
            
            <div className="">
              {items.map((item, index) => (
                <div key={index}>
                  <H3 className="">
                    {item.question}
                  </H3>
                  <Text className="">
                    {item.answer}
                  </Text>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      );
    }

    // Default variant
    return (
      <Section className={cn('space-y-6', className)} {...props}>
        <Container maxWidth="lg">
          {title && (
            <div className="">
              <H2 className="">{title}</H2>
              {subtitle && (
                <Text className="">{subtitle}</Text>
              )}
            </div>
          )}
          
          <div className="">
            {items.map((item, index) => (
              <div key={index} className="">
                <H3 className="">
                  {item.question}
                </H3>
                <Text className="">
                  {item.answer}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    );
  }
);
FAQ.displayName = 'FAQ';

export { FAQ }; 