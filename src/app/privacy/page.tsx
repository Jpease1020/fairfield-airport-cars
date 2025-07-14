"use client";

import { useCMS } from '@/hooks/useCMS';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import './page-editable.css';

export default function PrivacyPage() {
  const { config: cmsConfig } = useCMS();
  const privacyContent = cmsConfig?.pages?.privacy;

  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      if (user && (user.email === 'justin@fairfieldairportcar.com' || user.email === 'gregg@fairfieldairportcar.com')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (privacyContent) {
      setLocalContent(privacyContent);
    }
  }, [privacyContent]);

  const handleFieldChange = (field: string, value: string) => {
    setLocalContent((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const { cmsService } = await import('@/lib/cms-service');
      await cmsService.updateCMSConfiguration({
        pages: {
          ...cmsConfig?.pages,
          privacy: localContent,
        },
      });
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(null), 2000);
      setEditMode(false);
    } catch {
      setSaveMsg('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalContent(JSON.parse(JSON.stringify(privacyContent)));
    setEditMode(false);
    setSaveMsg(null);
  };

  return (
    <PageContainer maxWidth="2xl" padding="lg">
      {isAdmin && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}>
          {!editMode ? (
            <button className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700" onClick={() => setEditMode(true)}>
              Edit Mode
            </button>
          ) : (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          )}
          {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
        </div>
      )}
      <PageHeader title="Privacy Policy" />
      <PageContent>
        {editMode ? (
          <div className="flex flex-col gap-4">
            <label className="edit-label font-semibold">Title</label>
            <input
              className="editable-input text-2xl font-bold w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 px-4"
              value={localContent?.title || ''}
              onChange={e => handleFieldChange('title', e.target.value)}
            />
            <label className="edit-label font-semibold">Content</label>
            <textarea
              className="editable-textarea w-full mb-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4"
              value={localContent?.content || ''}
              onChange={e => handleFieldChange('content', e.target.value)}
              rows={12}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">{privacyContent?.title || 'Privacy Policy'}</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">{privacyContent?.content || 'Privacy policy details go here.'}</div>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
} 