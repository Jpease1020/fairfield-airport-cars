'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, Container, Stack, Textarea } from '@/ui';
import { useCMSData } from '@/design/hooks/useCMSData';

const FloatingEditorBox = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => `${$top}px`};
  left: ${({ $left }) => `${$left}px`};
  z-index: 11060;
  transform: translate(8px, 8px);
`;

interface InlineTextEditorProps {
  editMode?: boolean;
}

export default function InlineTextEditor({ editMode = false }: InlineTextEditorProps) {
  const { cmsData, updateField } = useCMSData();

  const [activePath, setActivePath] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [computedPosition, setComputedPosition] = useState<{ top: number; left: number } | null>(null);
  const [value, setValue] = useState<string>('');
  const boxRef = useRef<HTMLDivElement | null>(null);

  const openEditorFor = useCallback((element: HTMLElement, path: string, clickX: number, clickY: number) => {
    setSelectedElement(element);
    setActivePath(path);
    
    // Get the current text content from the DOM element instead of cmsData
    // This ensures the modal shows the actual text, not empty
    const currentText = element.textContent || element.innerText || '';
    setValue(currentText);
    
    setClickPosition({ x: clickX, y: clickY });
  }, []);

  const closeEditor = useCallback(() => {
    setActivePath(null);
    setSelectedElement(null);
    setClickPosition(null);
    setComputedPosition(null);
    setValue('');
  }, []);

  // Global click handler for edit mode - only active when editMode is true
  useEffect(() => {
    if (!editMode) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if the clicked element has a data-cms-id
      const cmsId = target.getAttribute('data-cms-id');
      if (cmsId) {
        e.preventDefault();
        e.stopPropagation();
        
        // Dispatch custom event to open edit modal
        const event = new (window as any).CustomEvent('openInlineEditor', {
          detail: { cmsId, element: target, x: e.clientX, y: e.clientY }
        });
        document.dispatchEvent(event);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [editMode]);

  // Simple approach: let editable text elements handle their own clicks
  // Each element with data-cms-id should have its own onClick handler
  // that calls openEditorFor when edit mode is active
  
  // Compute floating box position for the inline editor
  useLayoutEffect(() => {
    if (!clickPosition || !activePath) {
      setComputedPosition(null);
      return;
    }
    const padding = 8;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const measureAndSet = () => {
      const boxEl = boxRef.current;
      const fallbackRect = { width: 360, height: 240 } as { width: number; height: number };
      const boxRect = boxEl ? boxEl.getBoundingClientRect() : (fallbackRect as any);

      let left = clickPosition.x + padding;
      let top = clickPosition.y + padding;

      if (left + boxRect.width > viewportW - padding) {
        left = Math.max(padding, clickPosition.x - boxRect.width - padding);
      }
      if (top + boxRect.height > viewportH - padding) {
        top = Math.max(padding, clickPosition.y - boxRect.height - padding);
      }

      left = Math.min(Math.max(padding, left), Math.max(padding, viewportW - boxRect.width - padding));
      top = Math.min(Math.max(padding, top), Math.max(padding, viewportH - boxRect.height - padding));

      setComputedPosition({ top, left });
    };

    window.requestAnimationFrame(measureAndSet);
    const onResize = () => window.requestAnimationFrame(measureAndSet);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [clickPosition, activePath]);

  // Close on Escape
  useEffect(() => {
    if (!activePath) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEditor();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activePath, closeEditor]);

  // Listen for custom events to open the editor
  useEffect(() => {
    if (!editMode) return;
    
    const handleOpenEditor = (e: Event) => {
      const customEvent = e as any;
      const { cmsId, element, x, y } = customEvent.detail;
      openEditorFor(element as HTMLElement, cmsId, x, y);
    };

    document.addEventListener('openInlineEditor', handleOpenEditor);
    return () => document.removeEventListener('openInlineEditor', handleOpenEditor);
  }, [openEditorFor, editMode]);

  const handleSave = useCallback(async () => {
    if (!activePath) {
      return;
    }
    try {
      await updateField(activePath, value);
      // Prevent immediate reload from closing over before UI responds
    } catch (error) {
      // swallow; provider handles error state
    } finally {
      closeEditor();
    }
  }, [activePath, value, updateField, closeEditor]);

  return (
    <>
      {activePath && computedPosition && (
        <FloatingEditorBox $top={computedPosition.top} $left={computedPosition.left}>
          <Container variant="tooltip" padding="none">
            <div ref={boxRef as any} data-admin-control="true" onClick={(e: any) => e.stopPropagation()}>
              <Container variant="elevated" padding="lg">
                <Stack spacing="sm">
                  <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    rows={4}
                    placeholder={activePath}
                  />
                  <Stack direction="horizontal" spacing="sm">
                    <Button 
                      variant="primary" 
                      onClick={(e: any) => { 
                        // e.stopPropagation(); 
                        handleSave(); 
                      }} 
                      disabled={!value.trim()}
                      data-testid="save-button"
                    >
                      Save
                    </Button>
                    <Button variant="secondary" onClick={closeEditor}>
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Container>
            </div>
          </Container>
        </FloatingEditorBox>
      )}
    </>
  );
}


