'use client';

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Overlay, Container, Stack, Box, Button, Input, Text, Label, Badge } from '@/ui';
import { usePageData } from '@/hooks/usePageData';
import { colors, spacing, fontSize, shadows, transitions } from '@/design/system/tokens/tokens';

interface PageEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DrawerBody = styled(Box)`
  width: min(720px, 100vw);
  max-width: 50vw;
  height: 100vh;
  max-height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 11000; /* Above floating controls */
  overflow-y: auto;
  background: ${colors.background.primary};
  box-shadow: ${shadows.xl};
  border-left: 1px solid ${colors.border.light};

  @media (max-width: 768px) {
    width: 100vw;
    max-width: 100vw;
  }
`;

const HeaderContainer = styled(Container)`
  background: ${colors.background.secondary};
  border-bottom: 1px solid ${colors.border.light};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const FieldContainer = styled(Box)`
  background: ${colors.background.primary};
  border: 1px solid ${colors.border.light};
  border-radius: 8px;
  padding: ${spacing.md};
  transition: ${transitions.default};
  
  &:hover {
    border-color: ${colors.border.default};
    box-shadow: ${shadows.sm};
  }
  
  &:focus-within {
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[100]};
  }
`;

const StyledInput = styled(Input)`
  font-size: ${fontSize.md};
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.border.default};
  border-radius: 6px;
  transition: ${transitions.default};
  
  &:focus {
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[100]};
  }
  
  &::placeholder {
    color: ${colors.text.secondary};
  }
`;

const SaveButton = styled(Button)`
  min-width: 100px;
  position: relative;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
`;

const CenteredBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: ${spacing.xl};
`;

// Derive a predictable page id from route
function derivePageId(route: string): string {
  const clean = route.replace(/^\//, '').replace(/\/$/, '');
  if (!clean) return 'home';
  const [first, ...rest] = clean.split('/');
  // Align with CMSDesignProvider derivePageIdFromPath so drawer and provider load the same page
  if (first === 'booking' && rest.length > 0) return 'booking';
  if (first === 'book') return 'booking';
  if (first === 'payments' && rest[0] === 'pay-balance') return 'payments';
  return first;
}

export const PageEditorDrawer: React.FC<PageEditorDrawerProps> = ({ isOpen, onClose }) => {
  const route = typeof window !== 'undefined' ? window.location.pathname : '/';
  const pageId = useMemo(() => derivePageId(route), [route]);
  
  const { data, updateField, loading } = usePageData(pageId);
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    console.log('[Editor] isOpen:', isOpen, 'route:', route, 'pageId:', pageId);
    console.log('[Editor] data present:', !!data);
    if (data) {
      console.log('[Editor] Pages in data:', Object.keys(data.pages || {}));
      console.log('[Editor] Page data for', pageId, ':', data.pages?.[pageId]);
    }
  }, [isOpen, data, route, pageId]);

  // Get flat list of string fields for this page
  type Field = { key: string; label: string; value: string; path: string; category?: string };
  const fields: Array<Field> = useMemo(() => {
    const results: Array<Field> = [];
    if (!data) return results;

    const labelize = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

    const collectStrings = (node: any, basePath: string, depth: number = 0, category?: string) => {
      if (!node || typeof node !== 'object' || depth > 4) return;
      for (const key of Object.keys(node)) {
        const val = node[key];
        const path = basePath ? `${basePath}.${key}` : key;
        if (typeof val === 'string') {
          const last = key.split('.').pop() || key;
          results.push({ 
            key: path, 
            label: labelize(last), 
            value: val, 
            path,
            category: category || (depth === 0 ? 'General' : undefined)
          });
        } else if (val && typeof val === 'object') {
          collectStrings(val, path, depth + 1, category || (depth === 0 ? key : undefined));
        }
      }
    };

    // 1) strings under pages[pageId]
    const pageRoot: any = data?.pages?.[pageId] ?? null;
    if (pageRoot && typeof pageRoot === 'object') {
      collectStrings(pageRoot, `pages.${pageId}`);
    }

    // 2) strings under root section keyed by pageId (e.g., booking.*)
    const rootSection: any = data?.[pageId] ?? null;
    if (rootSection && typeof rootSection === 'object') {
      collectStrings(rootSection, `${pageId}`);
    }

    console.log('[Editor] computed fields count:', results.length, 'for pageId:', pageId);
    return results;
  }, [data, pageId]);

  const handleChange = (fieldKey: string, value: string) => {
    setLocalEdits(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleSaveAll = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      const entries = Object.entries(localEdits);
      console.log('[Editor] saving entries:', entries);
      
      for (const [path, value] of entries) {
        await updateField(path, value);
      }
      
      setLocalEdits({});
      onClose();
    } catch (error) {
      console.error('[Editor] Error saving fields:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = Object.keys(localEdits).length > 0;

  // Group fields by category
  const groupedFields = useMemo(() => {
    const groups: Record<string, Field[]> = {};
    fields.forEach(field => {
      const category = field.category || 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push(field);
    });
    return groups;
  }, [fields]);

  return (
    <Overlay isOpen={isOpen} onClose={onClose} variant="modal" position="right" closeOnBackdropClick zIndex={10990}>
      <DrawerBody as="section" variant="elevated" padding="none" data-admin-control="true">
        <Stack spacing="none">
          {/* Header */}
          <HeaderContainer padding="lg">
            <Stack direction="horizontal" align="center" justify="space-between">
              <Stack spacing="xs">
                <Text size="lg" weight="semibold" color="primary">Edit Content</Text>
                <Stack direction="horizontal" spacing="sm" align="center">
                  <Text size="sm" color="secondary">Page: {pageId}</Text>
                  <Badge variant="default" size="sm">{fields.length} fields</Badge>
                  {hasUnsavedChanges && (
                    <Badge variant="warning" size="sm">{Object.keys(localEdits).length} unsaved</Badge>
                  )}
                </Stack>
              </Stack>
              <Stack direction="horizontal" spacing="sm">
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <SaveButton 
                  variant="primary" 
                  onClick={handleSaveAll} 
                  disabled={!hasUnsavedChanges || saving}
                  loading={saving}
                >
                  {saving ? 'Saving...' : 'Save All'}
                </SaveButton>
              </Stack>
            </Stack>
          </HeaderContainer>

          {/* Body */}
          <Container padding="lg">
            {loading ? (
              <CenteredBox>
                <Stack spacing="lg" align="center" justify="center">
                  <Text size="md" color="secondary">Loading page content...</Text>
                </Stack>
              </CenteredBox>
            ) : fields.length === 0 ? (
              <CenteredBox>
                <Stack spacing="md" align="center" justify="center">
                  <Text size="lg" weight="medium" color="secondary">No editable content</Text>
                  <Text size="sm" color="secondary" align="center">
                    This page doesn't have any editable text fields configured in the CMS.
                  </Text>
                </Stack>
              </CenteredBox>
            ) : (
              <Stack spacing="lg">
                {Object.entries(groupedFields).map(([category, categoryFields]) => (
                  <Box key={category}>
                    <Stack spacing="md">
                      {Object.keys(groupedFields).length > 1 && (
                        <Text size="md" weight="semibold" color="primary">
                          {category}
                        </Text>
                      )}
                      {categoryFields.map(({ key, label, value, path }) => (
                        <FieldContainer key={key}>
                          <Stack spacing="xs">
                            <Label htmlFor={`field-${key}`} size="sm" weight="medium">
                              {label}
                            </Label>
                            <StyledInput
                              id={`field-${key}`}
                              value={localEdits[path] ?? value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(path, e.target.value)}
                              placeholder={label}
                              disabled={saving}
                            />
                          </Stack>
                        </FieldContainer>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Container>
        </Stack>
      </DrawerBody>
    </Overlay>
  );
};

export default PageEditorDrawer;
