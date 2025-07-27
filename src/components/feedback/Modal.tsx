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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <div className={cn(
          'relative transform overflow-hidden rounded-lg bg-bg-primary text-left shadow-xl transition-all sm:my-8 sm:w-full',
          sizeClasses[size]
        )}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <H2 className="text-lg font-medium text-text-primary">
          {title}
        </H2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-text-light hover:text-text-secondary"
        >
          <X className="h-5 w-5" />
        </Button>
          </div>
          
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Modal }; 