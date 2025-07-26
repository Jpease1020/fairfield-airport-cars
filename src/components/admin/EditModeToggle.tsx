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
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}>
        <Button
          onClick={onEdit}
          className=""
        >
          Edit Mode
        </Button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}>
      <div className="">
        <Button
          onClick={onSave}
          disabled={saving}
          className=""
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={saving}
          variant="outline"
          className=""
        >
          Cancel
        </Button>
      </div>
      {saveMsg && <div className="">{saveMsg}</div>}
    </div>
  );
}; 