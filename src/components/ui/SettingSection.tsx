import React from 'react';
import { Card, CardHeader, CardBody } from './card';
import { Text, H3 } from '@/components/ui';
import { IconContainer, ContentContainer, HeaderContainer, ActionsContainer } from './layout';

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
        <HeaderContainer align="between" gap="md">
          <ContentContainer direction="horizontal" align="center" justify="start" gap="sm" flex>
            {icon && (
              <IconContainer size={size} color="secondary" variant="default">
                {icon}
              </IconContainer>
            )}
            <ContentContainer direction="vertical" align="start" justify="start" gap="sm" flex>
              <H3>{title}</H3>
              {description && (
                <Text>{description}</Text>
              )}
            </ContentContainer>
          </ContentContainer>
          {actions && (
            <ActionsContainer align="end" gap="sm">
              {actions}
            </ActionsContainer>
          )}
        </HeaderContainer>
      </CardHeader>
      <CardBody>
        {children}
      </CardBody>
    </Card>
  );
}; 