"use client";

import { useCMS } from '@/hooks/useCMS';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/utils/firebase';
import { User } from 'firebase/auth';

import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { authService } from '@/lib/services/auth-service';
import '../page-editable.css';


export default function PrivacyPage() {
  const { config: cmsConfig } = useCMS();
  const privacyContent = cmsConfig?.pages?.privacy;

  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && await authService.isAdmin(user.uid)) {
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
      const { cmsService } = await import('@/lib/services/cms-service');
      const defaultHome = {
        hero: { title: '', subtitle: '', ctaText: '' },
        features: { title: '', items: [] },
        about: { title: '', content: '' },
        contact: { title: '', content: '', phone: '', email: '' }
      };
      const defaultHelp = {
        faq: [],
        contactInfo: { phone: '', email: '', hours: '' }
      };
      await cmsService.updateCMSConfiguration({
        pages: {
          home: cmsConfig?.pages?.home || defaultHome,
          help: cmsConfig?.pages?.help || defaultHelp,
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
            <Button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            >
              Edit Mode
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-success text-text-inverse hover:bg-success-hover"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={saving}
                variant="outline"
                className="bg-bg-secondary text-text-primary hover:bg-bg-muted"
              >
                Cancel
              </Button>
              {saveMsg && <div className="mt-2 text-sm text-success">{saveMsg}</div>}
            </div>
          )}
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