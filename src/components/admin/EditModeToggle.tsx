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
          className="bg-brand-primary text-text-inverse hover:bg-brand-primary-hover"
        >
          Edit Mode
        </Button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}>
      <div className="flex gap-2">
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-success text-text-inverse hover:bg-success-hover"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={saving}
          variant="outline"
          className="bg-bg-secondary text-text-primary hover:bg-bg-muted"
        >
          Cancel
        </Button>
      </div>
      {saveMsg && <div className="mt-2 text-sm text-success">{saveMsg}</div>}
    </div>
  );
}; 