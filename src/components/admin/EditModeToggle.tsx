import React from 'react';
import { Button } from '@/components/ui/button';

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
      <div>
        <Button onClick={onEdit}>
          Edit Mode
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button onClick={onCancel} disabled={saving} variant="outline">
          Cancel
        </Button>
      </div>
      {saveMsg && <div>{saveMsg}</div>}
    </div>
  );
}; 