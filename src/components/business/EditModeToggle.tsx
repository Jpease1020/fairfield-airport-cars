import React from 'react';
import { Button } from '@/design/components/base-components/Button';
import { Container } from '@/design/layout/containers/Container';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

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
  const { cmsData } = useCMSData();
  if (!editMode) {
    return (
      <Container>
        <Button onClick={onEdit}>
          {getCMSField(cmsData, 'editModeToggle.editModeButton', 'Edit Mode')}
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Button onClick={onSave} disabled={saving}>
        {saving ? getCMSField(cmsData, 'editModeToggle.savingButton', 'Saving...') : getCMSField(cmsData, 'editModeToggle.saveButton', 'Save')}
      </Button>
      <Button onClick={onCancel} disabled={saving} variant="outline">
        {getCMSField(cmsData, 'editModeToggle.cancelButton', 'Cancel')}
      </Button>
      {saveMsg && <Container>{saveMsg}</Container>}
    </Container>
  );
}; 