// Component Factory Utility
// Creates styled components with variant support using our design tokens

import styled from 'styled-components';
import { variants } from '../system/tokens/variants';

export interface ComponentConfig<T = any> {
  baseStyles: string;
  variants?: T;
  sizes?: Record<string, any>;
  defaultVariant?: keyof T;
  defaultSize?: string;
}

export function createComponent<T extends Record<string, any>>(
  config: ComponentConfig<T>
) {
  const { baseStyles, variants: componentVariants, sizes, defaultVariant, defaultSize } = config;

  return styled.div.withConfig({
    shouldForwardProp: (prop) => !['variant', 'size', 'fullWidth', 'disabled'].includes(prop)
  })<{
    variant?: keyof T;
    size?: string;
    fullWidth?: boolean;
    disabled?: boolean;
  }>`
    ${baseStyles}
    
    ${({ variant, size, fullWidth, disabled }) => `
      ${variant && componentVariants && componentVariants[variant as keyof T]}
      ${size && sizes && sizes[size]}
      ${fullWidth ? 'width: 100%;' : ''}
      ${disabled ? 'opacity: 0.6; cursor: not-allowed;' : ''}
    `}
  `;
}

// Specialized component creators
export function createButtonComponent() {
  return createComponent({
    baseStyles: `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      outline: none;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      border: none;
      cursor: pointer;
    `,
    variants: variants.button,
    sizes: variants.buttonSize,
    defaultVariant: 'primary',
    defaultSize: 'md',
  });
}

export function createCardComponent() {
  return createComponent({
    baseStyles: `
      display: block;
      border-radius: 0.375rem;
      transition: 0.2s ease-in-out;
    `,
    variants: variants.card,
    sizes: variants.cardSize,
    defaultVariant: 'default',
    defaultSize: 'md',
  });
}

export function createTextComponent() {
  return createComponent({
    baseStyles: `
      margin: 0;
      padding: 0;
    `,
    variants: variants.text,
    defaultVariant: 'body',
  });
}

export function createBadgeComponent() {
  return createComponent({
    baseStyles: `
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      line-height: 1;
    `,
    variants: variants.badge,
    defaultVariant: 'primary',
  });
}

export function createAlertComponent() {
  return createComponent({
    baseStyles: `
      display: flex;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid;
    `,
    variants: variants.alert,
    defaultVariant: 'info',
  });
} 