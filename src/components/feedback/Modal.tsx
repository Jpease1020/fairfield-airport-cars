import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Container, H2 } from '@/components/ui';

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
    <Container className="">
      <Container className="">
        <div 
          className=""
          onClick={onClose}
        />
        
        <Container className={cn(
          'relative transform overflow-hidden rounded-lg bg-bg-primary text-left shadow-xl transition-all sm:my-8 sm:w-full',
          sizeClasses[size]
        )}>
          <Container className="">
            <H2 className="">
              {title}
            </H2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className=""
            >
              <X className="" />
            </Button>
          </Container>
          
          <Container className="">
            {children}
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export { Modal }; 