import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings, DEFAULT_SETTINGS } from '@/types/settings';

const SETTINGS_DOC = doc(db, 'settings', 'global');

export async function getSettings(): Promise<Settings> {
  try {
    const snap = await getDoc(SETTINGS_DOC);
    if (!snap.exists()) {
      // save defaults for first time
      await setDoc(SETTINGS_DOC, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<Settings>) } as Settings;
  } catch (err) {
    console.error('Failed to load settings, falling back to defaults', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(partial: Partial<Settings>): Promise<void> {
  await setDoc(SETTINGS_DOC, partial, { merge: true });
} 