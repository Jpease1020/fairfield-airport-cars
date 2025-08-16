import React from 'react';
import { useInteractionMode } from '../../providers/InteractionModeProvider';

interface EditableProps {
  dataKey?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export function withEditable<P extends object>(
  Component: React.ComponentType<P>
) {
  return function EditableWrapper(props: P & EditableProps) {
    const { mode } = useInteractionMode();
    const { dataKey, ...componentProps } = props;

    const handleClick = (e: React.MouseEvent) => {
      if (mode === 'edit') {
        e.stopPropagation();
        e.preventDefault();
        
        // Get cmsId from either dataKey prop or data-cms-id attribute
        const cmsId = dataKey || (e.currentTarget as HTMLElement).getAttribute('data-cms-id');
        
        if (cmsId) {
          // Dispatch custom event to open edit modal
          const event = new (window as any).CustomEvent('openInlineEditor', {
            detail: { cmsId, element: e.currentTarget, x: e.clientX, y: e.clientY }
          });
          document.dispatchEvent(event);
        }
      } else if (mode === 'comment') {
        e.stopPropagation();
        e.preventDefault();
        
        // Get cmsId from either dataKey prop or data-cms-id attribute
        const cmsId = dataKey || (e.currentTarget as HTMLElement).getAttribute('data-cms-id');
        
        if (cmsId) {
          // Dispatch custom event to open comment modal
          const event = new (window as any).CustomEvent('openCommentModal', {
            detail: { cmsId, element: e.currentTarget, x: e.clientX, y: e.clientY }
          });
          document.dispatchEvent(event);
        }
      }
    };

    // Only add click handler if we're in an interaction mode
    const clickProps = mode ? { onClick: handleClick } : {};

    // Use a simple span to avoid design system conflicts
    return (
      <span 
        {...clickProps}
        data-cursor={mode ? 'pointer' : 'default'}
        data-display="inline-block"
      >
        <Component {...(componentProps as P)} />
      </span>
    );
  };
}
