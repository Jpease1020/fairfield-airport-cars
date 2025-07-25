'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/utils/firebase';
import { Button } from '@/components/ui/button';
import { cmsService } from '@/lib/services/cms-service';
import { authService } from '@/lib/services/auth-service';

interface EditModeContextType {
  isAdmin: boolean;
  editMode: boolean;
  localContent: any;
  saving: boolean;
  saveMsg: string | null;
  setEditMode: (mode: boolean) => void;
  setLocalContent: (content: any) => void;
  setSaving: (saving: boolean) => void;
  setSaveMsg: (msg: string | null) => void;
  handleFieldChange: (section: string, field: string, value: unknown, subfield?: string) => void;
  handleSave: (cmsConfig: any, pageType: string) => Promise<void>;
  handleCancel: (originalContent: any) => void;
  EditModeToggle: React.FC<{ className?: string }>;
  EditModeControls: React.FC<{ cmsConfig: any; pageType: string; originalContent: any }>;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

interface EditModeProviderProps {
  children: ReactNode;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Admin detection
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Use the proper auth service to check admin status
        const isAdminUser = await authService.isAdmin(user.uid);
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Standardized field change handler
  const handleFieldChange = (section: string, field: string, value: unknown, subfield?: string) => {
    setLocalContent((prev: any) => {
      const updated = { ...prev };
      if (subfield) {
        if (!updated[section]) updated[section] = {};
        updated[section][field] = { ...updated[section][field], [subfield]: value };
      } else if (field) {
        if (!updated[section]) updated[section] = {};
        updated[section][field] = value;
      } else {
        updated[section] = value;
      }
      return updated;
    });
  };

  // Standardized save handler
  const handleSave = async (cmsConfig: any, pageType: string) => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const user = auth.currentUser;
      console.log('Saving CMS content:', { localContent, user: user?.uid });
      
      const result = await cmsService.updateCMSConfiguration({
        pages: {
          ...cmsConfig?.pages,
          [pageType]: localContent,
        },
      }, user?.uid);
      
      console.log('Save result:', result);
      
      if (result.success) {
        setSaveMsg('Saved!');
        setTimeout(() => setSaveMsg(null), 2000);
        setEditMode(false);
      } else {
        setSaveMsg(`Failed to save: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMsg('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  // Standardized cancel handler
  const handleCancel = (originalContent: any) => {
    setLocalContent(JSON.parse(JSON.stringify(originalContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  // Standardized edit mode toggle component
  const EditModeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
    if (!isAdmin) return null;

    return (
      <div className={`fixed top-20 right-6 z-50 ${className}`}>
        {!editMode ? (
          <Button
            onClick={() => setEditMode(true)}
            className=""
          >
            Edit Mode
          </Button>
        ) : (
          <div className="">
            <Button
              onClick={() => setEditMode(false)}
              className=""
            >
              Exit Edit Mode
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Standardized edit mode controls component
  const EditModeControls: React.FC<{ cmsConfig: any; pageType: string; originalContent: any }> = ({ 
    cmsConfig, 
    pageType, 
    originalContent 
  }) => {
    if (!isAdmin || !editMode) return null;

    return (
      <div className="">
        <div className="">
          <Button
            onClick={() => handleSave(cmsConfig, pageType)}
            disabled={saving}
            className=""
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={() => handleCancel(originalContent)}
            variant="outline"
            className=""
          >
            Cancel
          </Button>
        </div>
        {saveMsg && (
          <div className="">
            {saveMsg}
          </div>
        )}
      </div>
    );
  };

  const value: EditModeContextType = {
    isAdmin,
    editMode,
    localContent,
    saving,
    saveMsg,
    setEditMode,
    setLocalContent,
    setSaving,
    setSaveMsg,
    handleFieldChange,
    handleSave,
    handleCancel,
    EditModeToggle,
    EditModeControls,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = (): EditModeContextType => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}; 