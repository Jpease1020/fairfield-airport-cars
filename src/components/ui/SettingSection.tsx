import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';
import { Card, CardHeader, CardBody } from './card';
import { Text, H3 } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

// Styled icon container
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  flex-shrink: 0;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          font-size: ${fontSize.sm};
          width: 1rem;
          height: 1rem;
        `;
      case 'md':
        return `
          font-size: ${fontSize.md};
          width: 1.25rem;
          height: 1.25rem;
        `;
      case 'lg':
        return `
          font-size: ${fontSize.lg};
          width: 1.5rem;
          height: 1.5rem;
        `;
      default:
        return `
          font-size: ${fontSize.md};
          width: 1.25rem;
          height: 1.25rem;
        `;
    }
  }}
`;

// Styled actions container
const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  margin-left: ${spacing.lg};
`;

// Styled header content
const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  flex: 1;
  min-width: 0;
`;

// Styled title row
const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

export interface SettingSectionProps {
  // Core props
  children: React.ReactNode;
  
  // Content
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  // Core props
  children,
  
  // Content
  title,
  description,
  icon,
  actions,
  
  // Appearance
  size = 'md',
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  return (
    <Card id={id} {...rest}>
      <CardHeader>
        <Stack direction="horizontal" justify="between" align="start">
          <HeaderContent>
            <TitleRow>
              {icon && (
                <IconContainer size={size}>
                  {icon}
                </IconContainer>
              )}
              <H3>
                {title}
              </H3>
            </TitleRow>
            
            {description && (
              <Text>
                {description}
              </Text>
            )}
          </HeaderContent>
          
          {actions && (
            <ActionsContainer>
              {actions}
            </ActionsContainer>
          )}
        </Stack>
      </CardHeader>
      
      <CardBody>
        {children}
      </CardBody>
    </Card>
  );
}; 