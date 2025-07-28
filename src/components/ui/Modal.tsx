import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions, zIndex } from '@/lib/design-system/tokens';
import { Button } from './button';

// Styled modal overlay with improved accessibility
const ModalOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'variant'].includes(prop)
})<{ isOpen: boolean; variant: 'default' | 'centered' | 'fullscreen' }>`
  position: fixed;
  inset: 0;
  z-index: ${zIndex.modal};
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  align-items: ${({ variant }) => variant === 'fullscreen' ? 'stretch' : 'center'};
  justify-content: center;
  padding: ${({ variant }) => variant === 'fullscreen' ? '0' : spacing.lg};
  background-color: ${colors.background.overlay};
  backdrop-filter: blur(4px);
  animation: ${({ isOpen }) => isOpen ? 'fadeIn 0.2s ease-out' : 'none'};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Styled backdrop with improved interaction
const ModalBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${colors.background.overlay};
  cursor: pointer;
  transition: ${transitions.default};
  
  &:hover {
    background-color: ${colors.background.overlay};
  }
`;

// Styled modal content with enhanced accessibility
const ModalContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'variant'].includes(prop)
})<{ size: 'sm' | 'md' | 'lg' | 'xl'; variant: 'default' | 'centered' | 'fullscreen' }>`
  position: relative;
  background-color: ${colors.background.primary};
  border-radius: ${({ variant }) => variant === 'fullscreen' ? '0' : borderRadius.lg};
  box-shadow: ${shadows.xl};
  max-height: ${({ variant }) => variant === 'fullscreen' ? '100vh' : `calc(100vh - ${spacing.xl} * 2)`};
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
  outline: none;

  /* Size styles */
  ${({ size, variant }) => {
    if (variant === 'fullscreen') {
      return `
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
      `;
    }
    
    switch (size) {
      case 'sm':
        return `
          max-width: 24rem;
          width: 100%;
        `;
      case 'md':
        return `
          max-width: 32rem;
          width: 100%;
        `;
      case 'lg':
        return `
          max-width: 48rem;
          width: 100%;
        `;
      case 'xl':
        return `
          max-width: 64rem;
          width: 100%;
        `;
      default:
        return `
          max-width: 32rem;
          width: 100%;
        `;
    }
  }}

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

// Styled modal header with improved layout
const ModalHeader = styled.div<{ variant: 'default' | 'minimal' | 'prominent' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.lg};
  border-bottom: 1px solid ${colors.border.light};
  
  ${({ variant }) => {
    switch (variant) {
      case 'minimal':
        return `
          padding: ${spacing.md};
          border-bottom: none;
        `;
      case 'prominent':
        return `
          padding: ${spacing.xl};
          background-color: ${colors.background.secondary};
          border-bottom: 2px solid ${colors.primary[600]};
        `;
      default:
        return '';
    }
  }}
`;

// Styled modal title with improved typography
const ModalTitle = styled.h2<{ size: 'sm' | 'md' | 'lg' }>`
  margin: 0;
  font-weight: 600;
  color: ${colors.text.primary};
  line-height: 1.4;
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.lg};`;
      case 'md':
        return `font-size: ${fontSize.xl};`;
      case 'lg':
        return `font-size: ${fontSize['2xl']};`;
      default:
        return `font-size: ${fontSize.xl};`;
    }
  }}
`;

// Styled modal body with improved scrolling
const ModalBody = styled.div<{ padding: 'none' | 'sm' | 'md' | 'lg' | 'xl' }>`
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  
  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return 'padding: 0;';
      case 'sm':
        return `padding: ${spacing.sm};`;
      case 'md':
        return `padding: ${spacing.md};`;
      case 'lg':
        return `padding: ${spacing.lg};`;
      case 'xl':
        return `padding: ${spacing.xl};`;
      default:
        return `padding: ${spacing.lg};`;
    }
  }}
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.border.default};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.border.dark};
  }
`;

// Styled modal footer with improved layout
const ModalFooter = styled.div<{ variant: 'default' | 'centered' | 'split' }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  border-top: 1px solid ${colors.border.light};
  background-color: ${colors.background.secondary};
  
  ${({ variant }) => {
    switch (variant) {
      case 'centered':
        return `
          justify-content: center;
        `;
      case 'split':
        return `
          justify-content: space-between;
        `;
      default:
        return `
          justify-content: flex-end;
        `;
    }
  }}
`;

// Styled close button with improved accessibility
const CloseButton = styled(Button)`
  border-radius: ${borderRadius.pill};
  width: 2rem;
  height: 2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSize.lg};
  line-height: 1;
`;

export interface ModalProps {
  // Core props
  children: React.ReactNode;
  
  // State
  isOpen: boolean;
  
  // Content
  title: string;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'centered' | 'fullscreen';
  
  // Interactive
  onClose: () => void;
  
  // Header
  headerVariant?: 'default' | 'minimal' | 'prominent';
  titleSize?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  
  // Body
  bodyPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Footer
  footer?: React.ReactNode;
  footerVariant?: 'default' | 'centered' | 'split';
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const Modal: React.FC<ModalProps> = React.forwardRef<HTMLDivElement, ModalProps>(({
  // Core props
  children,
  
  // State
  isOpen,
  
  // Content
  title,
  
  // Appearance
  size = 'md',
  variant = 'default',
  
  // Interactive
  onClose,
  
  // Header
  headerVariant = 'default',
  titleSize = 'md',
  showCloseButton = true,
  
  // Body
  bodyPadding = 'lg',
  
  // Footer
  footer,
  footerVariant = 'default',
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  
  // Rest props
  ...rest
}, ref) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Focus trap and management
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  
  React.useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay
      ref={ref}
      isOpen={isOpen}
      variant={variant}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedBy}
      onClick={handleBackdropClick}
      {...rest}
    >
      <ModalBackdrop />
      
      <ModalContent
        ref={modalRef}
        size={size}
        variant={variant}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && closeOnEscape) {
            e.preventDefault();
            onClose();
          }
        }}
      >
        <ModalHeader variant={headerVariant}>
          <ModalTitle size={titleSize}>{title}</ModalTitle>
          {showCloseButton && (
            <CloseButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </CloseButton>
          )}
        </ModalHeader>
        
        <ModalBody padding={bodyPadding}>
          {children}
        </ModalBody>
        
        {footer && (
          <ModalFooter variant={footerVariant}>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </ModalOverlay>
  );
});

Modal.displayName = 'Modal'; 