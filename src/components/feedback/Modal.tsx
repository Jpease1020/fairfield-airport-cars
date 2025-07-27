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
    <Container>
      <Container>
        <div 
          onClick={onClose}
        />
        
        <Container>
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
          
          <Container>
            {children}
          </Container>
        </Container>
      </Container>
    </Container>
  );
}); 