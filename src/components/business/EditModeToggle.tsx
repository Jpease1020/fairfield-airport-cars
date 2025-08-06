import React from 'react';
import { Button } from '@/design/components/base-components/Button';
import { Container } from '@/design/layout/containers/Container';
import { EditableText } from '@/design/components/base-components/text/EditableText';

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
          <EditableText field="editModeToggle.editModeButton" defaultValue="Edit Mode">
            Edit Mode
          </EditableText>
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Button onClick={onSave} disabled={saving}>
        {saving ? (
          <EditableText field="editModeToggle.savingButton" defaultValue="Saving...">
            Saving...
          </EditableText>
        ) : (
          <EditableText field="editModeToggle.saveButton" defaultValue="Save">
            Save
          </EditableText>
        )}
      </Button>
      <Button onClick={onCancel} disabled={saving} variant="outline">
        <EditableText field="editModeToggle.cancelButton" defaultValue="Cancel">
          Cancel
        </EditableText>
      </Button>
      {saveMsg && <Container>{saveMsg}</Container>}
    </Container>
  );
}; 