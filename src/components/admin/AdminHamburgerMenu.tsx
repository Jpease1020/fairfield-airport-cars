'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text, H3, Span, EditableText } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { useAdmin } from '@/components/admin/AdminProvider';
import styled from 'styled-components';
import { spacing, shadows, borderRadius } from '@/lib/design-system/tokens';

// Styled components for positioned menu
const MenuContainer = styled.div`
  position: fixed;
  top: 80px; /* Below the navigation */
  right: ${spacing.lg};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const MenuDropdown = styled.div`
  background: white;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: ${borderRadius.md};
  box-shadow: ${shadows.lg};
  padding: ${spacing.md};
  min-width: 280px;
  margin-top: ${spacing.sm};
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
`;

const HamburgerButton = styled(Button)`
  position: relative;
  z-index: 1001;
  background: white;
  border: 1px solid var(--border-color, #e5e7eb);
  box-shadow: ${shadows.md};
  
  &:hover {
    background: var(--background-hover, #f9fafb);
  }
`;

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
    <MenuContainer>
      {/* Hamburger Button */}
      <HamburgerButton
        onClick={toggleMenu}
        variant="ghost"
        size="sm"
      >
        <Span>
          <EditableText field="adminHamburgerMenu.menuIcon" defaultValue={isOpen ? '✕' : '☰'}>
            {isOpen ? '✕' : '☰'}
          </EditableText>
        </Span>
      </HamburgerButton>

      {/* Menu Dropdown */}
      {isOpen && (
        <MenuDropdown>
          <Stack spacing="md">
            <H3>
              <EditableText field="adminHamburgerMenu.title">Admin Tools</EditableText>
            </H3>
            <Text>
              <EditableText field="adminHamburgerMenu.subtitle">Website management</EditableText>
            </Text>

            {/* Site Mode Toggle */}
            <Button
              onClick={handleSiteModeToggle}
              variant="ghost"
            >
              <Span>🌐</Span>
              <Stack>
                <Span>
                  <EditableText field="adminHamburgerMenu.siteModeLabel">Site Mode</EditableText>
                </Span>
                <Span>
                  <EditableText field="adminHamburgerMenu.siteModeDescription">
                    {!editMode && !commentMode ? 'Currently viewing' : 'View normal site'}
                  </EditableText>
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
                <Span>
                  <EditableText field="adminHamburgerMenu.editModeLabel">Edit Content</EditableText>
                </Span>
                <Span>
                  <EditableText field="adminHamburgerMenu.editModeDescription">
                    {editMode ? 'Currently editing' : commentMode ? 'Disabled - Comment mode active' : 'Modify page content'}
                  </EditableText>
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
                <Span>
                  <EditableText field="adminHamburgerMenu.commentModeLabel">UI Change Requests</EditableText>
                </Span>
                <Span>
                  <EditableText field="adminHamburgerMenu.commentModeDescription">
                    {commentMode ? 'Comment mode active' : editMode ? 'Disabled - Edit mode active' : 'Request UI changes'}
                  </EditableText>
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
            <Span>-</Span>

            {/* Status Indicators */}
            <Stack direction="horizontal" align="center">
              <Span>●</Span>
              <Span>
                <EditableText field="adminHamburgerMenu.siteModeStatus">
                  Site Mode: {!editMode && !commentMode ? 'ON' : 'OFF'}
                </EditableText>
              </Span>
            </Stack>
            <Stack direction="horizontal" align="center">
              <Span>●</Span>
              <Span>
                <EditableText field="adminHamburgerMenu.editModeStatus">
                  Edit Mode: {editMode ? 'ON' : 'OFF'}
                </EditableText>
              </Span>
            </Stack>
            <Stack direction="horizontal" align="center">
              <Span>●</Span>
              <Span>
                <EditableText field="adminHamburgerMenu.commentModeStatus">
                  Comment Mode: {commentMode ? 'ON' : 'OFF'}
                </EditableText>
              </Span>
            </Stack>
          </Stack>
        </MenuDropdown>
      )}
    </MenuContainer>
  );
};

export default AdminHamburgerMenu; 