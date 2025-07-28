import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container, H2 } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ModalComponent = React.forwardRef<HTMLDivElement, ModalProps>(({
  isOpen,
  onClose,
  title,
  children
}, ref) => {
  if (!isOpen) return null;

  return (
    <div 
      ref={ref}
      style={{
        position: 'fixed',
        inset: '0',
        zIndex: '50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        onClick={onClose}
      />
        
      {/* Modal Content */}
      <div style={{
        position: 'relative',
        maxWidth: '32rem',
        width: '100%',
        margin: '0 1rem'
      }}>
        <Container variant="elevated" padding="lg">
          <Stack direction="horizontal" align="center" justify="between">
            <H2>
              {title}
            </H2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X />
            </Button>
          </Stack>
          
          {children}
          </Container>
        </div>
      </div>
  );
});

ModalComponent.displayName = 'Modal';

export const Modal = ModalComponent; 