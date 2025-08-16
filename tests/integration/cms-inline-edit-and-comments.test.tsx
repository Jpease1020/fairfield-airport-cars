import { describe, test, beforeEach, vi, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StyledComponentsRegistry } from '@/ui';
import { AdminProvider } from '@/design/providers/AdminProvider';
import { InteractionModeProvider } from '@/design/providers/InteractionModeProvider';

// Mock CMS provider directly to ensure updateField works - MUST BE FIRST
vi.mock('@/design/hooks/useCMSData', () => ({
  CMSDesignProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useCMSData: () => {
    console.log('🔍 Mock useCMSData called!');
    return {
      cmsData: {
        pages: {
          'test-edit-mode': {
            title: 'Test Edit Mode Page',
            description: 'This page has editable content. Try clicking the edit button (top-right) to open the editor.',
            customText: 'This text should be editable in the CMS editor.',
            instructions: 'Click the edit button to modify the content above. You can edit the title, description, custom text, and instructions.',
            reloadButton: 'Reload Page'
          },
          about: {
            hero: { title: 'About Fairfield Airport Cars', subtitle: 'Professional airport transportation services' },
          },
        },
        business: {
          company: { name: 'Fairfield Airport Cars' }
        }
      },
      loading: false,
      error: null,
      updateField: (fieldPath: string, value: string) => {
        console.log('🔍 Mock updateField called with:', fieldPath, value);
        return updateFieldSpy(fieldPath, value);
      },
      refresh: vi.fn(),
      reloadPage: vi.fn(),
    };
  },
  getCMSField: (cmsData: any, fieldPath: string, defaultValue: string = '') => {
    if (!cmsData) return defaultValue;
    const parts = fieldPath.split('.');
    let value: any = cmsData;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return defaultValue;
      }
    }
    return typeof value === 'string' ? value : defaultValue;
  },
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test-edit-mode',
  useParams: () => ({}),
  useServerInsertedHTML: vi.fn(() => {}),
}));

// Mock Firebase utilities module to control auth state
vi.mock('@/lib/utils/firebase', () => ({
  auth: {
    onAuthStateChanged: (callback: any) => {
      // Simulate authenticated admin user
      callback({ email: 'admin@example.com', uid: 'admin-1' });
      return () => {};
    },
    currentUser: { email: 'admin@example.com', uid: 'admin-1' },
    signOut: vi.fn(),
  },
  db: {},
}));

// Mock Firebase auth and firestore
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    console.log('🔍 Firebase auth mock: calling callback with admin user');
    callback({ email: 'admin@example.com', uid: 'admin-1' });
    return () => {};
  }),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'mock-doc-ref'),
  getDoc: vi.fn(() => {
    console.log('🔍 Firebase firestore mock: getDoc called, returning admin role');
    return Promise.resolve({
      exists: () => true,
      data: () => ({ role: 'admin' })
    });
  }),
}));

// Mock auth service for useAdminStatus hook
vi.mock('@/lib/services/auth-service', () => ({
  authService: {
    isAdmin: vi.fn(() => Promise.resolve(true)),
  },
}));

// Mock useAdminStatus hook
vi.mock('@/hooks/useAdminStatus', () => ({
  useAdminStatus: () => ({ isAdmin: true, loading: false }),
}));

// Mock usePageData hook for the test page
vi.mock('@/hooks/usePageData', () => ({
  usePageData: () => ({
    data: {
      pages: {
        'test-edit-mode': {
          title: 'Test Edit Mode Page',
          description: 'This page has editable content. Try clicking the edit button (top-right) to open the editor.',
          customText: 'This text should be editable in the CMS editor.',
          instructions: 'Click the edit button to modify the content above. You can edit the title, description, custom text, and instructions.',
          reloadButton: 'Reload Page'
        },
        home: {
          title: 'Home Page Title'
        }
      },
      business: {
        company: { name: 'Fairfield Airport Cars' }
      }
    },
    loading: false,
    error: null
  }),
}));

// Mock comments service
const addCommentSpy = vi.fn().mockResolvedValue('new_comment_1');
vi.mock('@/lib/business/comments-service', () => ({
  commentsService: {
    getComments: vi.fn().mockResolvedValue([]),
    addComment: addCommentSpy,
    updateComment: vi.fn().mockResolvedValue(undefined),
    deleteComment: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock CMS API calls
const updateFieldSpy = vi.fn().mockImplementation((fieldPath: string, value: string) => {
  console.log('🔍 updateFieldSpy called with:', fieldPath, value);
  return Promise.resolve(undefined);
});
global.fetch = vi.fn().mockImplementation((url, options) => {
  if (url.includes('/api/admin/cms/pages') && options?.method === 'PUT') {
    updateFieldSpy(options.body);
    return Promise.resolve({ ok: true });
  }
  if (url.includes('/api/admin/cms/pages')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        pages: {
          'test-edit-mode': {
            title: 'Test Edit Mode Page',
            description: 'This page has editable content. Try clicking the edit button (top-right) to open the editor.',
            customText: 'This text should be editable in the CMS editor.',
            instructions: 'Click the edit button to modify the content above. You can edit the title, description, custom text, and instructions.',
            reloadButton: 'Reload Page'
          }
        }
      })
    });
  }
  return Promise.resolve({ ok: false });
});

// Mock useAdmin hook at the lowest level to ensure AppContent gets isAdmin: true
vi.mock('@/design/providers/AdminProvider', () => ({
  AdminProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAdmin: () => ({ isAdmin: true, loading: false }),
}));

// Test wrapper that mimics the real app's provider hierarchy
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <AdminProvider>
        <InteractionModeProvider>
          {children}
        </InteractionModeProvider>
      </AdminProvider>
    </StyledComponentsRegistry>
  );
}

// Utility to render AppContent with proper providers
const renderWithProviders = async (ui: React.ReactElement) => {
  const { AppContent } = await import('@/app/AppContent');
  
  return render(
    <TestWrapper>
      <AppContent>
        {ui}
      </AppContent>
    </TestWrapper>
  );
};

describe('Inline text editing and comment modal integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Edit mode: clicking CMS text opens inline editor and saves the change', async () => {
    // Render the actual about page
    const AboutPage = (await import('@/app/(public)/about/page')).default;
    await renderWithProviders(<AboutPage />);

    // Wait for admin controls to initialize
    await waitFor(() => {
      expect(screen.getByTestId('floating-edit-button')).toBeInTheDocument();
    });

    // Click the floating edit button to open admin controls
    const editButton = screen.getByTestId('floating-edit-button');
    await userEvent.click(editButton);
    
    // Find and click the Edit Mode button
    const editModeButton = screen.getByText('○ Edit Mode');
    await userEvent.click(editModeButton);

    // Wait for edit mode to activate (check for ✓ instead of ○)
    await waitFor(() => {
      expect(screen.getByText('✓ Edit Mode')).toBeInTheDocument();
    });

    // Click on the page title to open inline editor
    const pageTitle = screen.getByText('About Fairfield Airport Cars', { selector: 'h1' });
    await userEvent.click(pageTitle);

    // Wait for inline editor to appear
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    // Get the editor and type new text
    const editor = screen.getByRole('textbox');
    await userEvent.clear(editor);
    await userEvent.type(editor, 'Updated About Page Title');
    
    // Save the changes
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);

    // Verify the inline editor appeared and allowed editing
    expect(editor).toHaveValue('Updated About Page Title');
  });

  test('Comment mode: clicking page elements opens comment box and adds a comment', async () => {
    // Mock comments service
    const { commentsService } = await import('@/lib/business/comments-service');
    const addCommentSpy = vi.spyOn(commentsService, 'addComment').mockResolvedValue('new-comment-1');

    // Render the actual about page
    const AboutPage = (await import('@/app/(public)/about/page')).default;
    await renderWithProviders(<AboutPage />);

    // Wait for admin controls to initialize
    await waitFor(() => {
      expect(screen.getByTestId('floating-edit-button')).toBeInTheDocument();
    });

    // Click the floating edit button to open admin controls
    const editButton = screen.getByTestId('floating-edit-button');
    await userEvent.click(editButton);
    
    // Find and click the Comment Mode button
    const commentModeButton = screen.getByText('○ Comment Mode');
    await userEvent.click(commentModeButton);

    // Wait for comment mode to activate (check for ✓ instead of ○)
    await waitFor(() => {
      expect(screen.getByText('✓ Comment Mode')).toBeInTheDocument();
    });

    // Click on the page title to open comment modal
    const pageTitle = screen.getByText('About Fairfield Airport Cars', { selector: 'h1' });
    await userEvent.click(pageTitle);

    // Wait for comment modal to appear
    await waitFor(() => {
      expect(screen.getByText('Add Comment', { selector: 'h4' })).toBeInTheDocument();
    });

    // Type comment and submit
    const commentInput = screen.getByPlaceholderText('Enter your comment...');
    await userEvent.type(commentInput, 'A test comment');
    await userEvent.click(screen.getByRole('button', { name: 'Add Comment' }));

    // Verify comment service was called with correct data
    expect(addCommentSpy).toHaveBeenCalledWith({
      comment: 'A test comment',
      createdBy: 'admin@example.com',
      elementId: expect.stringMatching(/^.*\.comment-\d+$/),
      elementSelector: expect.stringMatching(/^.*\.comment-\d+$/),
      elementText: 'About Fairfield Airport Cars',
      pageTitle: expect.any(String),
      pageUrl: expect.any(String),
      scope: 'page',
      status: 'open'
    });
  });

  test('Edit mode and comment mode are mutually exclusive', async () => {
    // Render the actual about page
    const AboutPage = (await import('@/app/(public)/about/page')).default;
    await renderWithProviders(<AboutPage />);

    // Wait for admin controls to initialize
    await waitFor(() => {
      expect(screen.getByTestId('floating-edit-button')).toBeInTheDocument();
    });

    // Open admin hamburger
    const toggle = screen.getByTestId('floating-edit-button');
    fireEvent.click(toggle);
    
    // Click Edit Mode first
    const editModeButton = screen.getByText('○ Edit Mode');
    fireEvent.click(editModeButton);
    
    // Edit Mode should now show as active
    expect(screen.getByText('✓ Edit Mode')).toBeInTheDocument();
    expect(screen.getByText('○ Comment Mode')).toBeInTheDocument();
    
    // Click Comment Mode - this should turn off Edit Mode
    const commentModeButton = screen.getByText('○ Comment Mode');
    fireEvent.click(commentModeButton);
    
    // Comment Mode should now be active, Edit Mode should be off
    expect(screen.getByText('○ Edit Mode')).toBeInTheDocument();
    expect(screen.getByText('✓ Comment Mode')).toBeInTheDocument();
  });

  test('Comment icons appear for existing comments when comment mode is active', async () => {
    // Mock comments service to return existing comments
    const { commentsService } = await import('@/lib/business/comments-service');
    vi.mocked(commentsService.getComments).mockResolvedValue([
      {
        id: 'existing-comment-1',
        elementId: 'pages.about.hero.title',
        elementText: 'About Fairfield Airport Cars',
        elementSelector: 'h1[data-cms-id="pages.about.hero.title"]',
        pageUrl: '/about',
        pageTitle: 'About',
        comment: 'This page title needs updating',
        status: 'open',
        createdBy: 'admin@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        scope: 'page'
      }
    ]);

    // Render the actual about page
    const AboutPage = (await import('@/app/(public)/about/page')).default;
    await renderWithProviders(<AboutPage />);

    // Wait for admin controls to initialize
    await waitFor(() => {
      expect(screen.getByTestId('floating-edit-button')).toBeInTheDocument();
    });

    // Click the floating edit button to open admin controls
    const editButton = screen.getByTestId('floating-edit-button');
    await userEvent.click(editButton);
    
    // Find and click the Comment Mode button
    const commentModeButton = screen.getByText('○ Comment Mode');
    await userEvent.click(commentModeButton);

    // Wait for comment mode to activate (check for ✓ instead of ○)
    await waitFor(() => {
      expect(screen.getByText('✓ Comment Mode')).toBeInTheDocument();
    });

    // Wait for comment icons to appear
    await waitFor(() => {
      expect(screen.getByTestId('comment-icon-1')).toBeInTheDocument();
    });

    // Verify comment icon is visible
    const commentIcon = screen.getByTestId('comment-icon-1');
    expect(commentIcon).toBeInTheDocument();
  });

  test('Comment icons show tooltips on hover', async () => {
    // Mock comments service to return existing comments
    const { commentsService } = await import('@/lib/business/comments-service');
    vi.mocked(commentsService.getComments).mockResolvedValue([
      {
        id: 'existing-comment-1',
        elementId: 'pages.about.hero.title',
        elementText: 'About Fairfield Airport Cars',
        elementSelector: 'h1[data-cms-id="pages.about.hero.title"]',
        pageUrl: '/about',
        pageTitle: 'About',
        comment: 'This page title needs updating',
        status: 'open',
        createdBy: 'admin@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        scope: 'page'
      }
    ]);

    // Render the actual about page
    const AboutPage = (await import('@/app/(public)/about/page')).default;
    await renderWithProviders(<AboutPage />);

    // Wait for admin controls to initialize
    await waitFor(() => {
      expect(screen.getByTestId('floating-edit-button')).toBeInTheDocument();
    });

    // Click the floating edit button to open admin controls
    const editButton = screen.getByTestId('floating-edit-button');
    await userEvent.click(editButton);
    
    // Find and click the Comment Mode button
    const commentModeButton = screen.getByText('○ Comment Mode');
    await userEvent.click(commentModeButton);

    // Wait for comment mode to activate (check for ✓ instead of ○)
    await waitFor(() => {
      expect(screen.getByText('✓ Comment Mode')).toBeInTheDocument();
    });

    // Wait for comment icons to appear
    await waitFor(() => {
      expect(screen.getByTestId('comment-icon-1')).toBeInTheDocument();
    });

    // Hover over comment icon to show tooltip
    const commentIcon = screen.getByTestId('comment-icon-1');
    await userEvent.hover(commentIcon);

    // Check that tooltip appears with comment content
    await waitFor(() => {
      expect(screen.getByText('This page title needs updating')).toBeInTheDocument();
      // Check that the tooltip shows the element text - use the h1 element specifically
      const heading = screen.getByText('About Fairfield Airport Cars', { selector: 'h1' });
      expect(heading).toBeInTheDocument();
    });
  });

  test('Orphaned comments are displayed in sticky container', async () => {
    // Mock comments service to return orphaned comments (elements that don't exist on page)
    const { commentsService } = await import('@/lib/business/comments-service');
    vi.mocked(commentsService.getComments).mockResolvedValue([
      {
        id: 'orphaned-comment-1',
        elementId: 'pages.about.nonexistent.field',
        elementText: 'This element no longer exists',
        elementSelector: 'div[data-cms-id="pages.about.nonexistent.field"]',
        pageUrl: '/about',
        pageTitle: 'About',
        comment: 'This comment is orphaned',
        status: 'open',
        createdBy: 'admin@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        scope: 'page'
      }
    ]);

    // Render the actual about page
    const AboutPage = (await import('@/app/(public)/about/page')).default;
    await renderWithProviders(<AboutPage />);

    // Wait for admin controls to initialize
    await waitFor(() => {
      expect(screen.getByTestId('floating-edit-button')).toBeInTheDocument();
    });

    // Click the floating edit button to open admin controls
    const editButton = screen.getByTestId('floating-edit-button');
    await userEvent.click(editButton);
    
    // Find and click the Comment Mode button
    const commentModeButton = screen.getByText('○ Comment Mode');
    await userEvent.click(commentModeButton);

    // Wait for comment mode to activate (check for ✓ instead of ○)
    await waitFor(() => {
      expect(screen.getByText('✓ Comment Mode')).toBeInTheDocument();
    });

    // Wait for orphaned comments container to appear
    await waitFor(() => {
      expect(screen.getByText('Orphaned Comments')).toBeInTheDocument();
    });

    // Verify orphaned comment is displayed
    expect(screen.getByText('This comment is orphaned')).toBeInTheDocument();
    expect(screen.getByText('This element no longer exists')).toBeInTheDocument();
  });

  test('Comment creation adds data-comment-id attribute to elements', async () => {
    // Mock comments service
    const { commentsService } = await import('@/lib/business/comments-service');
    const addCommentSpy = vi.spyOn(commentsService, 'addComment').mockResolvedValue('new-comment-1');

    // Render the actual about page
    const AboutPage = (await import('@/app/(public)/about/page')).default;
    await renderWithProviders(<AboutPage />);

    // Wait for admin controls to initialize
    await waitFor(() => {
      expect(screen.getByTestId('floating-edit-button')).toBeInTheDocument();
    });

    // Click the floating edit button to open admin controls
    const editButton = screen.getByTestId('floating-edit-button');
    await userEvent.click(editButton);
    
    // Find and click the Comment Mode button
    const commentModeButton = screen.getByText('○ Comment Mode');
    await userEvent.click(commentModeButton);

    // Wait for comment mode to activate (check for ✓ instead of ○)
    await waitFor(() => {
      expect(screen.getByText('✓ Comment Mode')).toBeInTheDocument();
    });

    // Click on the page title to open comment modal
    const pageTitle = screen.getByText('About Fairfield Airport Cars', { selector: 'h1' });
    await userEvent.click(pageTitle);

    // Wait for comment modal to appear
    await waitFor(() => {
      expect(screen.getByText('Add Comment', { selector: 'h4' })).toBeInTheDocument();
    });

    // Type comment and submit
    const commentInput = screen.getByPlaceholderText('Enter your comment...');
    await userEvent.type(commentInput, 'A test comment');
    await userEvent.click(screen.getByRole('button', { name: 'Add Comment' }));

    // Verify comment service was called with correct data
    expect(addCommentSpy).toHaveBeenCalledWith({
      comment: 'A test comment',
      createdBy: 'admin@example.com',
      elementId: expect.stringMatching(/^.*\.comment-\d+$/),
      elementSelector: expect.stringMatching(/^.*\.comment-\d+$/),
      elementText: 'About Fairfield Airport Cars',
      pageTitle: expect.any(String),
      pageUrl: expect.any(String),
      scope: 'page',
      status: 'open'
    });

    // Verify the element now has a data-comment-id attribute
    await waitFor(() => {
      const element = screen.getByText('About Fairfield Airport Cars', { selector: 'h1' });
      expect(element).toHaveAttribute('data-comment-id');
    });
  });
});


