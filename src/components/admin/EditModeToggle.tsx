import React from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui';

interface EditModeToggleProps {
  editMode: boolean;
  saving: boolean;
  saveMsg: string | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditModeToggle: React.FC<EditModeToggleProps> = ({
  editMode,
  saving,
  saveMsg,
  onEdit,
  onSave,
  onCancel,
}) => {
  if (!editMode) {
    return (
      <Container>
        <Button onClick={onEdit}>
          Edit Mode
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
      <Button onClick={onCancel} disabled={saving} variant="outline">
        Cancel
      </Button>
      {saveMsg && <Container>{saveMsg}</Container>}
    </Container>
  );
}; 