import React from 'react';
import { Button } from '@/design/components/base-components/Button';
import { Container } from '@/design/layout/containers/Container';

interface EditModeToggleProps {
  editMode: boolean;
  saving: boolean;
  saveMsg: string | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  cmsData: any;
}

export const EditModeToggle: React.FC<EditModeToggleProps> = ({
  editMode,
  saving,
  saveMsg,
  onEdit,
  onSave,
  onCancel,
  cmsData,
}) => {
  if (!editMode) {
    return (
      <Container>
        <Button onClick={onEdit} cmsId="edit-mode-toggle-edit-button" text={cmsData?.['editModeToggle-editModeButton'] || 'Edit Mode'} />
      </Container>
    );
  }

  return (
    <Container>
      <Button onClick={onSave} disabled={saving} cmsId="edit-mode-toggle-save-button" text={saving ? cmsData?.['editModeToggle-savingButton'] || 'Saving...' : cmsData?.['editModeToggle-saveButton'] || 'Save'} />
      <Button onClick={onCancel} disabled={saving} variant="outline" cmsId="edit-mode-toggle-cancel-button" text={cmsData?.['editModeToggle-cancelButton'] || 'Cancel'} />
      {saveMsg && <Container>{saveMsg}</Container>}
    </Container>
  );
}; 