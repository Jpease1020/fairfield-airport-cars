'use client';

import React from 'react';
import { colors, spacing, fontSize, borderRadius } from '../../design-system/tokens';
import { Button } from '@/ui';
import { Overlay } from '../forms/Overlay';

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'centered' | 'fullscreen';
  onClose: () => void;
  headerVariant?: 'default' | 'minimal' | 'prominent';
  titleSize?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  bodyPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  footerVariant?: 'default' | 'centered' | 'split';
  'aria-label'?: string;
  'aria-describedby'?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  [key: string]: any;
}

export const Modal: React.FC<ModalProps> = React.forwardRef<HTMLDivElement, ModalProps>(({
  children,
  isOpen,
  title,
  size = 'md',
  variant = 'default',
  onClose,
  headerVariant = 'default',
  titleSize = 'md',
  showCloseButton = true,
  bodyPadding = 'lg',
  footer,
  footerVariant = 'default',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ...rest
}, ref) => {
  const titleStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: fontSize.lg },
    md: { fontSize: fontSize.xl },
    lg: { fontSize: fontSize['2xl'] }
  };

  const paddingStyles: Record<string, React.CSSProperties> = {
    none: { padding: 0 },
    sm: { padding: spacing.sm },
    md: { padding: spacing.md },
    lg: { padding: spacing.lg },
    xl: { padding: spacing.xl }
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { maxWidth: '24rem' },
    md: { maxWidth: '32rem' },
    lg: { maxWidth: '48rem' },
    xl: { maxWidth: '64rem' }
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: headerVariant === 'minimal' ? spacing.md : headerVariant === 'prominent' ? spacing.xl : spacing.lg,
    borderBottom: headerVariant === 'minimal' ? 'none' : `1px solid ${colors.border.light}`,
    backgroundColor: headerVariant === 'prominent' ? colors.background.secondary : 'transparent',
    borderBottomWidth: headerVariant === 'prominent' ? '2px' : '1px',
    borderBottomColor: headerVariant === 'prominent' ? colors.primary[600] : colors.border.light
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontWeight: 600,
    color: colors.text.primary,
    lineHeight: 1.4,
    ...titleStyles[titleSize]
  };

  const bodyStyle: React.CSSProperties = {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
    ...paddingStyles[bodyPadding]
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTop: `1px solid ${colors.border.light}`,
    backgroundColor: colors.background.secondary,
    justifyContent: footerVariant === 'centered' ? 'center' : footerVariant === 'split' ? 'space-between' : 'flex-end'
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    backgroundColor: colors.background.primary,
    borderRadius: variant === 'fullscreen' ? 0 : borderRadius.lg,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxHeight: variant === 'fullscreen' ? '100vh' : `calc(100vh - ${spacing.xl} * 2)`,
    overflow: 'hidden',
    outline: 'none',
    ...(variant === 'fullscreen' ? {
      width: '100vw',
      height: '100vh',
      maxWidth: 'none',
      maxHeight: 'none'
    } : sizeStyles[size])
  };

  return (
    <Overlay
      ref={ref}
      isOpen={isOpen}
      onClose={onClose}
      variant="modal"
      position="center"
      closeOnBackdropClick={closeOnBackdropClick}
      closeOnEscape={closeOnEscape}
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedBy}
      {...rest}
    >
      <div style={contentStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          {showCloseButton && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label="Close modal"
            >
              ×
            </Button>
          )}
        </div>
        
        <div style={bodyStyle}>
          {children}
        </div>
        
        {footer && (
          <div style={footerStyle}>
            {footer}
          </div>
        )}
      </div>
    </Overlay>
  );
});

Modal.displayName = 'Modal'; 