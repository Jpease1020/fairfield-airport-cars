'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Container, Text, H3, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { useAdmin } from '@/components/admin/AdminProvider';

const AdminHamburgerMenu = () => {
  const { editMode, commentMode, setEditMode, setCommentMode } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleEditModeToggle = () => {
    if (commentMode && !editMode) return;
    setEditMode(!editMode);
    if (editMode) {
      setCommentMode(false);
    }
  };

  const handleCommentModeToggle = () => {
    if (editMode && !commentMode) return;
    setCommentMode(!commentMode);
    if (commentMode) {
      setEditMode(false);
    }
  };

  const handleSiteModeToggle = () => {
    setEditMode(false);
    setCommentMode(false);
    setIsOpen(false);
  };

  return (
    <Container>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        aria-label="Admin menu"
      >
        <Span>{isOpen ? '✕' : '☰'}</Span>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <Container>
          <Stack>
            <H3>Admin Tools</H3>
            <Text>Website management</Text>
          </Stack>

          {/* Site Mode Toggle */}
          <Button
            onClick={handleSiteModeToggle}
            variant="ghost"
          >
            <Span>🌐</Span>
            <Stack>
              <Span>Site Mode</Span>
              <Span>
                {!editMode && !commentMode ? 'Currently viewing' : 'View normal site'}
              </Span>
            </Stack>
            {!editMode && !commentMode && (
              <Span>✓</Span>
            )}
          </Button>

          {/* Edit Mode Toggle */}
          <Button
            onClick={handleEditModeToggle}
            variant="ghost"
            disabled={commentMode && !editMode}
          >
            <Span>✏️</Span>
            <Stack>
              <Span>Edit Content</Span>
              <Span>
                {editMode ? 'Currently editing' : commentMode ? 'Disabled - Comment mode active' : 'Modify page content'}
              </Span>
            </Stack>
            {editMode && (
              <Span>✓</Span>
            )}
            {commentMode && !editMode && (
              <Span>✗</Span>
            )}
          </Button>

          {/* Comment Mode Toggle */}
          <Button
            onClick={handleCommentModeToggle}
            variant="ghost"
            disabled={editMode && !commentMode}
          >
            <Span>💬</Span>
            <Stack>
              <Span>UI Change Requests</Span>
              <Span>
                {commentMode ? 'Comment mode active' : editMode ? 'Disabled - Edit mode active' : 'Request UI changes'}
              </Span>
            </Stack>
            {commentMode && (
              <Span>✓</Span>
            )}
            {editMode && !commentMode && (
              <Span>✗</Span>
            )}
          </Button>

          {/* Divider */}
          <Container>
            <Span>-</Span>
          </Container>

          {/* Status Indicators */}
          <Stack>
            <Container>
              <Container>
                <Span>●</Span>
              </Container>
              <Span>Site Mode: {!editMode && !commentMode ? 'ON' : 'OFF'}</Span>
            </Container>
            <Container>
              <Container>
                <Span>●</Span>
              </Container>
              <Span>Edit Mode: {editMode ? 'ON' : 'OFF'}</Span>
            </Container>
            <Container>
              <Container>
                <Span>●</Span>
              </Container>
              <Span>Comment Mode: {commentMode ? 'ON' : 'OFF'}</Span>
            </Container>
          </Stack>
        </Container>
      )}
    </Container>
  );
};

export default AdminHamburgerMenu; 