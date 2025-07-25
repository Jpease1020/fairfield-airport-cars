'use client';

import { useState } from 'react';
import { useAdmin } from './AdminProvider';

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
    <div className="admin-hamburger-menu">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="hamburger-btn"
        aria-label="Admin menu"
      >
        <span className="hamburger-icon">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="hamburger-dropdown">
          <div className="dropdown-header">
            <h3 className="dropdown-title">Admin Tools</h3>
            <p className="dropdown-subtitle">Website management</p>
          </div>

          {/* Site Mode Toggle */}
          <button
            onClick={handleSiteModeToggle}
            className={`dropdown-item ${!editMode && !commentMode ? 'active' : ''}`}
          >
            <span className="item-icon">🌐</span>
            <div className="item-content">
              <div className="item-title">Site Mode</div>
              <div className="item-description">
                {!editMode && !commentMode ? 'Currently viewing' : 'View normal site'}
              </div>
            </div>
            {!editMode && !commentMode && (
              <div className="status-indicator active"></div>
            )}
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={handleEditModeToggle}
            className={`dropdown-item ${editMode ? 'active edit-mode' : ''} ${commentMode && !editMode ? 'disabled' : ''}`}
            disabled={commentMode && !editMode}
          >
            <span className="item-icon">✏️</span>
            <div className="item-content">
              <div className="item-title">Edit Content</div>
              <div className="item-description">
                {editMode ? 'Currently editing' : commentMode ? 'Disabled - Comment mode active' : 'Modify page content'}
              </div>
            </div>
            {editMode && (
              <div className="status-indicator active edit-mode"></div>
            )}
            {commentMode && !editMode && (
              <div className="status-indicator disabled"></div>
            )}
          </button>

          {/* Comment Mode Toggle */}
          <button
            onClick={handleCommentModeToggle}
            className={`dropdown-item ${commentMode ? 'active comment-mode' : ''} ${editMode && !commentMode ? 'disabled' : ''}`}
            disabled={editMode && !commentMode}
          >
            <span className="item-icon">💬</span>
            <div className="item-content">
              <div className="item-title">UI Change Requests</div>
              <div className="item-description">
                {commentMode ? 'Comment mode active' : editMode ? 'Disabled - Edit mode active' : 'Request UI changes'}
              </div>
            </div>
            {commentMode && (
              <div className="status-indicator active comment-mode"></div>
            )}
            {editMode && !commentMode && (
              <div className="status-indicator disabled"></div>
            )}
          </button>

          {/* Divider */}
          <div className="dropdown-divider"></div>

          {/* Status Indicators */}
          <div className="status-section">
            <div className="status-item">
              <div className={`status-dot ${!editMode && !commentMode ? 'active' : ''}`}></div>
              <span>Site Mode: {!editMode && !commentMode ? 'ON' : 'OFF'}</span>
            </div>
            <div className="status-item">
              <div className={`status-dot edit-mode ${editMode ? 'active' : ''}`}></div>
              <span>Edit Mode: {editMode ? 'ON' : 'OFF'}</span>
            </div>
            <div className="status-item">
              <div className={`status-dot comment-mode ${commentMode ? 'active' : ''}`}></div>
              <span>Comment Mode: {commentMode ? 'ON' : 'OFF'}</span>
            </div>
            <div className="status-note">
              <div className="note-dot"></div>
              <span>Edit & Comment modes are mutually exclusive</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicators on Button */}
      <div className="button-indicators">
        {!editMode && !commentMode && (
          <div className="indicator-dot active"></div>
        )}
        {editMode && (
          <div className="indicator-dot edit-mode"></div>
        )}
        {commentMode && (
          <div className="indicator-dot comment-mode"></div>
        )}
      </div>
    </div>
  );
};

export default AdminHamburgerMenu; 