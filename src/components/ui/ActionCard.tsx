import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';
import { Text, Link } from '@/components/ui';
import { Stack, Card } from '@/components/ui/layout/containers';
import { Button } from './button';
import { EditableText } from '@/components/ui';

// Styled icon container
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'disabled'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ disabled }) => disabled ? colors.text.disabled : colors.text.secondary};
  flex-shrink: 0;
  transition: ${transitions.default};

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

// Styled content container
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm};
  text-align: center;
`;

// Styled label container
const LabelContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'disabled'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
}>`
  font-weight: 600;
  color: ${({ disabled }) => disabled ? colors.text.disabled : colors.text.primary};
  transition: ${transitions.default};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}
`;

// Styled description container
const DescriptionContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'disabled'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
}>`
  color: ${({ disabled }) => disabled ? colors.text.disabled : colors.text.secondary};
  font-size: ${fontSize.sm};
  line-height: 1.4;
  transition: ${transitions.default};
`;

// Styled card wrapper
const CardWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['disabled', 'interactive'].includes(prop)
})<{
  disabled: boolean;
  interactive: boolean;
}>`
  transition: ${transitions.default};
  cursor: ${({ disabled, interactive }) => {
    if (disabled) return 'not-allowed';
    if (interactive) return 'pointer';
    return 'default';
  }};

  ${({ disabled, interactive }) => !disabled && interactive && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  `}
`;

export interface ActionCardProps {
  // Core props
  children?: React.ReactNode;
  
  // Content
  icon: React.ReactNode;
  label: string | React.ReactNode;
  description?: string | React.ReactNode;
  
  // Behavior
  href?: string;
  onClick?: () => void;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  
  // States
  disabled?: boolean;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  // Core props
  children,
  
  // Content
  icon,
  label,
  description,
  
  // Behavior
  href,
  onClick,
  
  // Appearance
  size = 'md',
  
  // States
  disabled = false,
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  const content = (
    <ContentContainer>
      <IconContainer size={size} disabled={disabled}>
        {icon}
      </IconContainer>
      
      <LabelContainer size={size} disabled={disabled}>
        {typeof label === 'string' ? (
          <EditableText field="actioncard.label" defaultValue={label}>
            {label}
          </EditableText>
        ) : (
          label
        )}
      </LabelContainer>
      
      {description && (
        <DescriptionContainer size={size} disabled={disabled}>
          {typeof description === 'string' ? (
            <EditableText field="actioncard.description" defaultValue={description}>
              {description}
            </EditableText>
          ) : (
            description
          )}
        </DescriptionContainer>
      )}
      
      {children}
    </ContentContainer>
  );

  const cardContent = (
    <Card variant="outlined" padding={size} {...rest}>
      {content}
    </Card>
  );

  if (disabled) {
    return (
      <CardWrapper disabled={disabled} interactive={false} id={id}>
        {cardContent}
      </CardWrapper>
    );
  }

  if (href) {
    return (
      <Link href={href}>
        <CardWrapper disabled={disabled} interactive={true} id={id}>
          {cardContent}
        </CardWrapper>
      </Link>
    );
  }

  if (onClick) {
    return (
      <Button onClick={onClick} disabled={disabled}>
        <CardWrapper disabled={disabled} interactive={true} id={id}>
          {cardContent}
        </CardWrapper>
      </Button>
    );
  }

  return (
    <CardWrapper disabled={disabled} interactive={false} id={id}>
      {cardContent}
    </CardWrapper>
  );
}; 