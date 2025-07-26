import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';

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
    <div className="">
      <div className="">
        <div 
          className=""
          onClick={onClose}
        />
        
        <div className={cn(
          'relative transform overflow-hidden rounded-lg bg-bg-primary text-left shadow-xl transition-all sm:my-8 sm:w-full',
          sizeClasses[size]
        )}>
          <div className="">
            <h2 className="">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className=""
            >
              <X className="" />
            </Button>
          </div>
          
          <div className="">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Modal }; 