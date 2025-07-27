import React, { useState } from 'react';
import { Section, Container, H2, H3, Text, Button } from '@/components/ui';
import { cn } from '@/lib/utils/utils';

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

export const FAQ: React.FC<FAQProps> = ({
  title,
  subtitle,
  items,
  variant = 'default',
  className,
  ...props
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  if (variant === 'accordion') {
    const toggleItem = (index: number) => {
      const newOpenItems = new Set(openItems);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      setOpenItems(newOpenItems);
    };

    return (
      <Section className={cn('space-y-4', className)} {...props}>
        <Container maxWidth="lg">
          {title && (
            <Container>
              <H2>{title}</H2>
              {subtitle && (
                <Text>{subtitle}</Text>
              )}
            </Container>
          )}
          
          <Container>
            {items.map((item, index) => (
              <Container key={index} className="card">
                <Button
                  variant="ghost"
                  onClick={() => toggleItem(index)}
                >
                  <span>{item.question}</span>
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
                  <Container>
                    <Text>{item.answer}</Text>
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
            <Container>
              <H2>{title}</H2>
              {subtitle && (
                <Text>{subtitle}</Text>
              )}
            </Container>
          )}
          
          <Container>
            {items.map((item, index) => (
              <Container key={index}>
                <H3>
                  {item.question}
                </H3>
                <Text>
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
          <Container>
            <H2>{title}</H2>
            {subtitle && (
              <Text>{subtitle}</Text>
            )}
          </Container>
        )}
        
        <Container>
          {items.map((item, index) => (
            <Container key={index} className="border-b border-border-color pb-6 last:border-b-0">
              <H3>
                {item.question}
              </H3>
              <Text>
                {item.answer}
              </Text>
            </Container>
          ))}
        </Container>
      </Container>
    </Section>
  );
}; 