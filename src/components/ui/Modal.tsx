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

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(({
  isOpen,
  onClose,
  title,
  children
}, ref) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
        
      {/* Modal Content */}
      <div className="relative max-w-lg w-full mx-4">
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