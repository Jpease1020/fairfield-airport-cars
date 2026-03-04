/* global Headers */
import { auth } from '@/lib/utils/firebase';

export const authFetch = async (input: RequestInfo, init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  const finalInit = { ...init };

  const user = auth?.currentUser ?? null;
  if (user) {
    try {
      const token = await user.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (error) {
      console.error('Failed to attach auth token:', error);
    }
  }

  if (!finalInit.credentials) {
    finalInit.credentials = 'include';
  }

  finalInit.headers = headers;
  return fetch(input, finalInit);
};
