'use client';

import React from 'react';
import { Container, H2, Text, Button } from '@/ui';
import { usePageData } from '@/hooks/usePageData';

export default function TestEditModePage() {
  const { data, loading, error } = usePageData('test-edit-mode');

  // Debug logging
  React.useEffect(() => {
    console.log('[TestEditMode] Data:', data);
    console.log('[TestEditMode] Loading:', loading);
    console.log('[TestEditMode] Error:', error);
    
    if (data) {
      console.log('[TestEditMode] Pages:', data.pages);
      console.log('[TestEditMode] Test page data:', data.pages?.['test-edit-mode']);
    }
  }, [data, loading, error]);

  if (loading) {
    return (
      <Container variant="elevated" padding="lg">
        <H2>Loading page data...</H2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="elevated" padding="lg">
        <H2>Error loading page data: {error}</H2>
      </Container>
    );
  }

  return (
    <Container variant="elevated" padding="lg">
      <H2>{data?.pages?.['test-edit-mode']?.title || 'Test Edit Mode Page'}</H2>
      <Text>
        {data?.pages?.['test-edit-mode']?.description || 'This page has editable content. Try clicking the edit button (top-right) to open the editor.'}
      </Text>
      <Text>
        Company Name: {data?.business?.company?.name || 'Not found'}
      </Text>
      <Text>
        Home Title: {data?.pages?.home?.title || 'Not found'}
      </Text>
      <Text>
        {data?.pages?.['test-edit-mode']?.customText || 'This text should be editable in the CMS editor.'}
      </Text>
      <Text>
        {data?.pages?.['test-edit-mode']?.instructions || 'Click the edit button to modify the content above. You can edit the title, description, custom text, and instructions.'}
      </Text>
      <Button onClick={() => window.location.reload()}>
        {data?.pages?.['test-edit-mode']?.reloadButton || 'Reload Page'}
      </Button>
    </Container>
  );
}
