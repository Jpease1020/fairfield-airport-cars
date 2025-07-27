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
      <div className="edit-mode-toggle edit-mode-toggle-inactive">
        <Button
          onClick={onEdit}
          className="edit-mode-toggle-button"
        >
          Edit Mode
        </Button>
      </div>
    );
  }

  return (
    <div className="edit-mode-toggle edit-mode-toggle-active">
      <div className="edit-mode-toggle-actions">
        <Button
          onClick={onSave}
          disabled={saving}
          className="edit-mode-toggle-save-button"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={saving}
          variant="outline"
          className="edit-mode-toggle-cancel-button"
        >
          Cancel
        </Button>
      </div>
      {saveMsg && <div className="edit-mode-toggle-message">{saveMsg}</div>}
    </div>
  );
}; 