import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
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

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

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
};

export { Modal }; 