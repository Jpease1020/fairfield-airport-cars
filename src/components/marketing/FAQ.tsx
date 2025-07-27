import React, { useState } from 'react';
import { Section, Container, H2, H3, Text, Button, Span } from '@/components/ui';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  variant?: 'default' | 'accordion' | 'simple';
  spacing?: 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FAQ: React.FC<FAQProps> = ({
  title,
  subtitle,
  items,
  variant = 'default',
  spacing = 'md',
  maxWidth = 'lg'
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
      <Section padding={spacing}>
        <Container maxWidth={maxWidth}>
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
                <Button
                  variant="ghost"
                  onClick={() => toggleItem(index)}
                >
                  <Span>{item.question}</Span>
                  <Span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Span>
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
      <Section padding={spacing}>
        <Container maxWidth={maxWidth}>
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
    <Section padding={spacing}>
      <Container maxWidth={maxWidth}>
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
}; 