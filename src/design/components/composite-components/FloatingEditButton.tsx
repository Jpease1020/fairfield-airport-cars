'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Text } from '../base-components/text/Text';
import { Button } from '../base-components/Button';

interface FloatingEditButtonProps {
  isAdmin?: boolean;
  isAuthenticated?: boolean;
  editMode?: boolean;
  onToggleEditMode?: () => void;
  onToggleCommentMode?: () => void;
  onToggleSiteMode?: () => void;
  isLoading?: boolean;
}

const FloatingContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const FloatingButton = styled(Button)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const AdminPanel = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 60px;
  right: 0;
  background: var(--background-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  border-top: 1px solid var(--border-color);
`;

const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PanelButton = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary);
  background-color: ${props => props.$isActive ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$isActive ? 'white' : 'var(--text-primary)'};

  &:hover {
    background-color: ${props => props.$isActive ? 'var(--primary-color)' : 'var(--background-secondary)'};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
`;

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 4h16v2H2V4zm0 5h16v2H2V9zm0 5h16v2H2v-2z" />
  </svg>
);

export const FloatingEditButton: React.FC<FloatingEditButtonProps> = ({
  isAdmin = false,
  isAuthenticated = false,
  editMode = false,
  onToggleEditMode,
  onToggleCommentMode,
  onToggleSiteMode,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commentMode, setCommentMode] = useState(false);
  const [siteMode, setSiteMode] = useState('live');

  // Don't render if not logged in or not admin
  if (isLoading) {
    return null;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleEditMode = () => {
    if (onToggleEditMode) {
      onToggleEditMode();
    }
  };

  const handleCommentMode = () => {
    setCommentMode(!commentMode);
    if (onToggleCommentMode) {
      onToggleCommentMode();
    }
  };

  const handleSiteMode = () => {
    setSiteMode(siteMode === 'live' ? 'draft' : 'live');
    if (onToggleSiteMode) {
      onToggleSiteMode();
    }
  };

  return (
    <FloatingContainer>
      <FloatingButton
        variant="primary"
        size="sm"
        onClick={togglePanel}
      >
        <HamburgerIcon />
      </FloatingButton>

      <AdminPanel $isOpen={isOpen}>
        <PanelContent>
          <Text variant="small" weight="semibold" color="muted">
            Admin Panel
          </Text>

          <PanelButton
            onClick={handleEditMode}
            $isActive={editMode}
          >
            {editMode ? '✓' : '○'} Edit Mode
          </PanelButton>

          <PanelButton
            onClick={handleCommentMode}
            $isActive={commentMode}
          >
            {commentMode ? '✓' : '○'} Comments
          </PanelButton>

          <PanelButton
            onClick={handleSiteMode}
            $isActive={siteMode === 'draft'}
          >
            {siteMode === 'draft' ? '✓' : '○'} {siteMode === 'live' ? 'Live Mode' : 'Draft Mode'}
          </PanelButton>

          <Divider />

          <PanelButton onClick={() => window.open('/admin', '_blank')}>
            → Admin Dashboard
          </PanelButton>

          <PanelButton onClick={() => window.open('/admin/cms', '_blank')}>
            → Content Manager
          </PanelButton>
        </PanelContent>
      </AdminPanel>
    </FloatingContainer>
  );
}; 