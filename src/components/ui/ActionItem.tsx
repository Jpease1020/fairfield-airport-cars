'use client';

import React from 'react';
import { Button } from './button';
import { Container, Span } from '@/components/ui';

export interface ActionItemProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost';
  icon?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ActionItem - A reusable component for action buttons with consistent styling
 * 
 * @example
 * ```tsx
 * <ActionItem
 *   label="Save Changes"
 *   onClick={() => handleSave()}
 *   variant="primary"
 *   icon="💾"
 * />
 * ```
 */
export const ActionItem: React.FC<ActionItemProps> = ({
  label,
  onClick,
  variant = 'outline',
  icon,
  disabled = false,
  size = 'md'
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Span>{icon}</Span>}
      {label}
    </Button>
  );
};

export default ActionItem; 