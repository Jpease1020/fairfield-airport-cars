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
              <Container className="text-center mb-4">
                <H2 className="page-title">{title}</H2>
                {subtitle && (
                  <Text className="page-subtitle">{subtitle}</Text>
                )}
              </Container>
            )}
            
            <Container className="space-y-4">
              {items.map((item, index) => (
                <Container key={index} className="card">
                  <Button
                    variant="ghost"
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-background-secondary"
                  >
                    <span className="font-medium">{item.question}</span>
                    <svg
                      className={cn(
                        'w-5 h-5 transition-transform',
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
                    <Container className="px-4 pb-4">
                      <Text className="leading-relaxed">{item.answer}</Text>
                    </Container>
                  )}
                </Container>
              ))}
            </Container>
          </Container>
        </Section>
      );
    }

    if (variant === 'simple') {
      return (
        <Section className={cn('space-y-6', className)} {...props}>
          <Container maxWidth="lg">
            {title && (
              <Container className="text-center mb-4">
                <H2 className="page-title">{title}</H2>
                {subtitle && (
                  <Text className="page-subtitle">{subtitle}</Text>
                )}
              </Container>
            )}
            
            <Container className="space-y-6">
              {items.map((item, index) => (
                <Container key={index} className="text-center">
                  <H3 className="text-xl font-semibold mb-2">
                    {item.question}
                  </H3>
                  <Text className="leading-relaxed">
                    {item.answer}
                  </Text>
                </Container>
              ))}
            </Container>
          </Container>
        </Section>
      );
    }

    // Default variant
    return (
      <Section className={cn('space-y-6', className)} {...props}>
        <Container maxWidth="lg">
          {title && (
            <Container className="text-center mb-4">
              <H2 className="page-title">{title}</H2>
              {subtitle && (
                <Text className="page-subtitle">{subtitle}</Text>
              )}
            </Container>
          )}
          
          <Container className="space-y-6">
            {items.map((item, index) => (
              <Container key={index} className="border-b border-border-color pb-6 last:border-b-0">
                <H3 className="text-xl font-semibold mb-3">
                  {item.question}
                </H3>
                <Text className="leading-relaxed">
                  {item.answer}
                </Text>
              </Container>
            ))}
          </Container>
        </Container>
      </Section>
    );
  }
);
FAQ.displayName = 'FAQ';

export { FAQ }; 