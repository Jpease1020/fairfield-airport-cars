import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import HomePage from '../../../src/app/page';
import { EditModeProvider } from '../../../src/components/admin/EditModeProvider';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock API calls
global.fetch = jest.fn();

// Mock CMS service
jest.mock('@/lib/services/cms-service', () => ({
  getContent: jest.fn(),
  updateContent: jest.fn(),
  saveContent: jest.fn()
}));

describe('CMS Editing - Admin Journey', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn()
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
  });

  it('allows Gregg to edit homepage content in admin mode', async () => {
    const user = userEvent.setup();
    const mockCMSResponse = {
      content: {
        'homepage.hero.title': '🚗 Premium Airport Transportation',
        'homepage.hero.description': 'Reliable, comfortable rides to and from Fairfield Airport',
        'homepage.features.title': 'Why Choose Us?'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCMSResponse
    });

    render(
      <EditModeProvider>
        <HomePage />
      </EditModeProvider>
    );

    // Should show editable content
    await waitFor(() => {
      expect(screen.getByText('🚗 Premium Airport Transportation')).toBeInTheDocument();
    });

    // Should have edit buttons for editable content
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('allows Gregg to edit text content inline', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: {} })
    });

    render(
      <EditModeProvider>
        <HomePage />
      </EditModeProvider>
    );

    // Find an editable text element
    const editableText = screen.getByText('🚗 Premium Airport Transportation');
    expect(editableText).toBeInTheDocument();

    // Click to edit
    await user.click(editableText);

    // Should show edit input
    const editInput = screen.getByDisplayValue('🚗 Premium Airport Transportation');
    expect(editInput).toBeInTheDocument();

    // Edit the text
    await user.clear(editInput);
    await user.type(editInput, '🚗 Premium Airport Transportation - Updated');

    // Should show save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('saves content changes to CMS', async () => {
    const user = userEvent.setup();
    const mockSaveResponse = {
      success: true,
      message: 'Content saved successfully'
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSaveResponse
      });

    render(
      <EditModeProvider>
        <HomePage />
      </EditModeProvider>
    );

    // Find and click an edit button
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    if (editButtons.length > 0) {
      await user.click(editButtons[0]);
      
      // Should show save button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });
      
      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/content saved successfully/i)).toBeInTheDocument();
      });
    }
  });

  it('handles CMS save errors gracefully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} })
      })
      .mockRejectedValueOnce(new Error('CMS Save Error'));

    render(
      <EditModeProvider>
        <HomePage />
      </EditModeProvider>
    );

    // Find and click an edit button
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    if (editButtons.length > 0) {
      await user.click(editButtons[0]);
      
      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error saving content/i)).toBeInTheDocument();
      });
    }
  });

  it('displays content in read-only mode for customers', () => {
    render(<HomePage />);

    // Should not show edit buttons for customers
    const editButtons = screen.queryAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBe(0);

    // Should display content normally
    expect(screen.getByText('🚗 Premium Airport Transportation')).toBeInTheDocument();
  });

  it('provides accessible editing controls', () => {
    render(
      <EditModeProvider>
        <HomePage />
      </EditModeProvider>
    );

    // Edit buttons should have accessible names
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    editButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });

    // Save buttons should have accessible names
    const saveButtons = screen.queryAllByRole('button', { name: /save/i });
    saveButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('validates content before saving', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: {} })
    });

    render(
      <EditModeProvider>
        <HomePage />
      </EditModeProvider>
    );

    // Find an editable text element
    const editableText = screen.getByText('🚗 Premium Airport Transportation');
    await user.click(editableText);

    // Try to save empty content
    const editInput = screen.getByDisplayValue('🚗 Premium Airport Transportation');
    await user.clear(editInput);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/content cannot be empty/i)).toBeInTheDocument();
    });
  });
}); 