import React, { useState } from 'react';
import { Section, Container, H2, H3, Text, Button, Span, EditableText } from '@/components/ui';

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
              <H2>
                <EditableText field="faq.title" defaultValue={title}>
                  {title}
                </EditableText>
              </H2>
              {subtitle && (
                <Text>
                  <EditableText field="faq.subtitle" defaultValue={subtitle}>
                    {subtitle}
                  </EditableText>
                </Text>
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
                  <Span>
                    <EditableText field={`faq.item${index}.question`} defaultValue={item.question}>
                      {item.question}
                    </EditableText>
                  </Span>
                  <Span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Span>
                </Button>
                
                {openItems.has(index) && (
                  <Container>
                    <Text>
                      <EditableText field={`faq.item${index}.answer`} defaultValue={item.answer}>
                        {item.answer}
                      </EditableText>
                    </Text>
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
              <H2>
                <EditableText field="faq.title" defaultValue={title}>
                  {title}
                </EditableText>
              </H2>
              {subtitle && (
                <Text>
                  <EditableText field="faq.subtitle" defaultValue={subtitle}>
                    {subtitle}
                  </EditableText>
                </Text>
              )}
            </Container>
          )}
          
          <Container>
            {items.map((item, index) => (
              <Container key={index}>
                <H3>
                  <EditableText field={`faq.item${index}.question`} defaultValue={item.question}>
                    {item.question}
                  </EditableText>
                </H3>
                <Text>
                  <EditableText field={`faq.item${index}.answer`} defaultValue={item.answer}>
                    {item.answer}
                  </EditableText>
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
            <H2>
              <EditableText field="faq.title" defaultValue={title}>
                {title}
              </EditableText>
            </H2>
            {subtitle && (
              <Text>
                <EditableText field="faq.subtitle" defaultValue={subtitle}>
                  {subtitle}
                </EditableText>
              </Text>
            )}
          </Container>
        )}
        
        <Container>
          {items.map((item, index) => (
            <Container key={index}>
              <H3>
                <EditableText field={`faq.item${index}.question`} defaultValue={item.question}>
                  {item.question}
                </EditableText>
              </H3>
              <Text>
                <EditableText field={`faq.item${index}.answer`} defaultValue={item.answer}>
                  {item.answer}
                </EditableText>
              </Text>
            </Container>
          ))}
        </Container>
      </Container>
    </Section>
  );
}; 