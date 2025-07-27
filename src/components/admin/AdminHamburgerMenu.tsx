'use client';

import { useState } from 'react';
import { useAdmin } from './AdminProvider';
import { Button, Text, H3 } from '@/components/ui';

const AdminHamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, editMode, commentMode, toggleEditMode, toggleCommentMode } = useAdmin();

  console.log('🔍 AdminHamburgerMenu - isAdmin:', isAdmin, 'editMode:', editMode, 'commentMode:', commentMode);

  // Always show in development mode
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost')
  );

  if (!isAdmin && !isDev && !isLocalhost) {
    console.log('❌ AdminHamburgerMenu - Not rendering because isAdmin is false and not in dev mode');
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
    <div>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        aria-label="Admin menu"
      >
        <span>{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div>
          <div>
            <H3>Admin Tools</H3>
            <Text>Website management</Text>
          </div>

          {/* Site Mode Toggle */}
          <Button
            onClick={handleSiteModeToggle}
            variant="ghost"

          >
            <span >🌐</span>
            <div >
              <div >Site Mode</div>
              <div >
                {!editMode && !commentMode ? 'Currently viewing' : 'View normal site'}
              </div>
            </div>
            {!editMode && !commentMode && (
              <div ></div>
            )}
          </Button>

          {/* Edit Mode Toggle */}
          <Button
            onClick={handleEditModeToggle}
            variant="ghost"
            disabled={commentMode && !editMode}

          >
            <span >✏️</span>
            <div >
              <div >Edit Content</div>
              <div >
                {editMode ? 'Currently editing' : commentMode ? 'Disabled - Comment mode active' : 'Modify page content'}
              </div>
            </div>
            {editMode && (
              <div ></div>
            )}
            {commentMode && !editMode && (
              <div ></div>
            )}
          </Button>

          {/* Comment Mode Toggle */}
          <Button
            onClick={handleCommentModeToggle}
            variant="ghost"
            disabled={editMode && !commentMode}

          >
            <span >💬</span>
            <div >
              <div >UI Change Requests</div>
              <div >
                {commentMode ? 'Comment mode active' : editMode ? 'Disabled - Edit mode active' : 'Request UI changes'}
              </div>
            </div>
            {commentMode && (
              <div ></div>
            )}
            {editMode && !commentMode && (
              <div ></div>
            )}
          </Button>

          {/* Divider */}
          <div></div>

          {/* Status Indicators */}
          <div >
            <div >
              <div></div>
              <span>Site Mode: {!editMode && !commentMode ? 'ON' : 'OFF'}</span>
            </div>
            <div >
              <div></div>
              <span>Edit Mode: {editMode ? 'ON' : 'OFF'}</span>
            </div>
            <div >
              <div></div>
              <span>Comment Mode: {commentMode ? 'ON' : 'OFF'}</span>
            </div>
            <div >
              <div ></div>
              <span>Edit & Comment modes are mutually exclusive</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicators on Button */}
      <div>
        {!editMode && !commentMode && (
          <div></div>
        )}
        {editMode && (
          <div></div>
        )}
        {commentMode && (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default AdminHamburgerMenu; 