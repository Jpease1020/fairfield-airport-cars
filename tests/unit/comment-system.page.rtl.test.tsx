import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, vi, expect } from 'vitest';
import React from 'react';

// Hoisted store for in-memory Firestore behavior
const { store } = vi.hoisted(() => ({ store: new Map<string, any>() }));

// Boundary mocks: Firestore and our db export
vi.mock('firebase/firestore', () => {
  return {
    collection: (_db: any, name: string) => ({ name }),
    doc: (_db: any, col: { name: string }) => ({ id: `test_${Date.now()}`, col: col.name }),
    setDoc: async (ref: any, data: any) => { store.set(ref.id, data); },
    updateDoc: async (ref: any, updates: any) => {
      const curr = store.get(ref.id) || {};
      store.set(ref.id, { ...curr, ...updates });
    },
    deleteDoc: async (ref: any) => { store.delete(ref.id); },
    query: (base: any) => base,
    where: () => ({}),
    orderBy: () => ({}),
    getDocs: async () => ({ docs: Array.from(store.values()).map((d) => ({ data: () => d })) }),
  };
});

vi.mock('@/lib/utils/firebase', () => ({ db: {} }));

// Minimal provider wrappers for admin/comment mode
vi.mock('@/hooks/useAdminStatus', () => ({ useAdminStatus: () => ({ isAdmin: true }) }));
vi.mock('@/design/providers/EditModeProvider', () => ({ useEditMode: () => ({ commentMode: true }) }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { email: 'admin@example.com', uid: 'admin-1' } }) }));

import CommentSystem from '@/components/business/CommentSystem';

describe('CommentSystem at page level (RTL)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.clear();
    Object.defineProperty(window, 'location', { value: { pathname: '/test-page' }, writable: true });
    document.title = 'Test Page';
  });

  test('adds an app-wide comment after clicking target', async () => {
    render(
      <CommentSystem>
        <div data-testid="click-target">Target Text</div>
      </CommentSystem>
    );
    
    const target = screen.getByTestId('click-target');
    fireEvent.click(target);

    // Assert the clicked element is marked active for commenting
    expect(target).toHaveAttribute('data-comment-active', 'true');

    const textarea = screen.getByPlaceholderText('Enter your comment...');
    fireEvent.change(textarea, { target: { value: 'This is a test comment' } });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole('button', { name: /add comment/i }));

    await waitFor(() => {
      expect(Array.from(store.values()).some((d) => d.comment === 'This is a test comment' && d.scope === 'app')).toBe(true);
    });

    // Comment box should close and active marker cleared
    await waitFor(() => {
      expect(target).not.toHaveAttribute('data-comment-active');
    });
  });
});


