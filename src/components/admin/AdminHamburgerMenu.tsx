'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Edit3, MessageSquare, X, Globe, Eye } from 'lucide-react';
import { useAdmin } from './AdminProvider';

const AdminHamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, editMode, commentMode, toggleEditMode, toggleCommentMode } = useAdmin();

  console.log('🔍 AdminHamburgerMenu - isAdmin:', isAdmin, 'editMode:', editMode, 'commentMode:', commentMode);

  if (!isAdmin) {
    console.log('❌ AdminHamburgerMenu - Not rendering because isAdmin is false');
    return null;
  }

  console.log('✅ AdminHamburgerMenu - Rendering hamburger menu');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleEditModeToggle = () => {
    // Edit mode and comment mode are mutually exclusive
    // When enabling edit mode, comment mode will be automatically disabled
    toggleEditMode();
    setIsOpen(false);
  };

  const handleCommentModeToggle = () => {
    // Edit mode and comment mode are mutually exclusive
    // When enabling comment mode, edit mode will be automatically disabled
    toggleCommentMode();
    setIsOpen(false);
  };

  const handleSiteModeToggle = () => {
    // Turn off both edit and comment modes
    if (editMode) toggleEditMode();
    if (commentMode) toggleCommentMode();
    setIsOpen(false);
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Hamburger Button */}
      <Button
        onClick={toggleMenu}
        className="bg-brand-primary hover:bg-brand-primary-hover text-text-inverse rounded-full w-12 h-12 shadow-lg border-2 border-white"
        aria-label="Admin menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-white rounded-lg shadow-xl border border-border-primary min-w-48 py-2 z-50 backdrop-blur-sm">
          <div className="px-4 py-2 border-b border-border-muted">
            <h3 className="text-sm font-semibold text-text-primary">Admin Tools</h3>
            <p className="text-xs text-text-secondary">Website management</p>
          </div>

          {/* Site Mode Toggle */}
          <button
            onClick={handleSiteModeToggle}
            className="w-full px-4 py-3 text-left hover:bg-bg-secondary flex items-center gap-3 transition-colors text-text-primary"
          >
            <Globe className="h-4 w-4 text-text-secondary" />
            <div className="flex-1">
              <div className="text-sm font-medium">Site Mode</div>
              <div className="text-xs text-text-secondary">
                {!editMode && !commentMode ? 'Currently viewing' : 'View normal site'}
              </div>
            </div>
            {!editMode && !commentMode && (
              <div className="w-2 h-2 bg-success rounded-full"></div>
            )}
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={handleEditModeToggle}
            className={`w-full px-4 py-3 text-left hover:bg-bg-secondary flex items-center gap-3 transition-colors ${
              editMode ? 'bg-info text-text-inverse' : commentMode ? 'text-text-muted cursor-not-allowed' : 'text-text-primary'
            }`}
            disabled={commentMode && !editMode}
          >
            <Edit3 className={`h-4 w-4 ${editMode ? 'text-text-inverse' : commentMode ? 'text-text-muted' : 'text-text-secondary'}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">Edit Content</div>
              <div className="text-xs text-text-secondary">
                {editMode ? 'Currently editing' : commentMode ? 'Disabled - Comment mode active' : 'Modify page content'}
              </div>
            </div>
            {editMode && (
              <div className="w-2 h-2 bg-text-inverse rounded-full"></div>
            )}
            {commentMode && !editMode && (
              <div className="w-2 h-2 bg-border-muted rounded-full"></div>
            )}
          </button>

          {/* Comment Mode Toggle */}
          <button
            onClick={handleCommentModeToggle}
            className={`w-full px-4 py-3 text-left hover:bg-bg-secondary flex items-center gap-3 transition-colors ${
              commentMode ? 'bg-warning text-text-inverse' : editMode ? 'text-text-muted cursor-not-allowed' : 'text-text-primary'
            }`}
            disabled={editMode && !commentMode}
          >
            <MessageSquare className={`h-4 w-4 ${commentMode ? 'text-text-inverse' : editMode ? 'text-text-muted' : 'text-text-secondary'}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">UI Change Requests</div>
              <div className="text-xs text-text-secondary">
                {commentMode ? 'Comment mode active' : editMode ? 'Disabled - Edit mode active' : 'Request UI changes'}
              </div>
            </div>
            {commentMode && (
              <div className="w-2 h-2 bg-text-inverse rounded-full"></div>
            )}
            {editMode && !commentMode && (
              <div className="w-2 h-2 bg-border-muted rounded-full"></div>
            )}
          </button>

          {/* Divider */}
          <div className="border-t border-border-muted my-1"></div>

          {/* Status Indicators */}
          <div className="px-4 py-2 text-xs text-text-secondary">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${!editMode && !commentMode ? 'bg-success' : 'bg-border-muted'}`}></div>
              <span>Site Mode: {!editMode && !commentMode ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${editMode ? 'bg-info' : 'bg-border-muted'}`}></div>
              <span>Edit Mode: {editMode ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${commentMode ? 'bg-warning' : 'bg-border-muted'}`}></div>
              <span>Comment Mode: {commentMode ? 'ON' : 'OFF'}</span>
            </div>
            <div className="border-t border-border-muted pt-2 text-xs text-text-muted">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-border-muted rounded-full"></div>
                <span>Edit & Comment modes are mutually exclusive</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicators on Button */}
      <div className="absolute -top-1 -right-1 flex gap-1">
        {!editMode && !commentMode && (
          <div className="w-3 h-3 bg-success rounded-full border-2 border-white"></div>
        )}
        {editMode && (
          <div className="w-3 h-3 bg-info rounded-full border-2 border-white"></div>
        )}
        {commentMode && (
          <div className="w-3 h-3 bg-warning rounded-full border-2 border-white"></div>
        )}
      </div>
    </div>
  );
};

export default AdminHamburgerMenu; 