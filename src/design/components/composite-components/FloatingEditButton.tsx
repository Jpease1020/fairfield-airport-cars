'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Text } from '../base-components/text/Text';
import { Button } from '../base-components/Button';

interface FloatingEditButtonProps {
  isAdmin?: boolean;
  isAuthenticated?: boolean;
  editMode?: boolean;
  commentMode?: boolean;
  onToggleEditMode?: () => void;
  onToggleCommentMode?: () => void;
  isLoading?: boolean;
}

const FloatingContainer = styled.div`
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 10000;
`;

const FloatingButton = styled(Button)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const AdminPanel = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 60px;
  right: 0;
  background: var(--background-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  border-top: 1px solid var(--border-color);
  z-index: 10001;
`;

const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PanelText = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
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

const HamburgerIcon = styled.div<{ $isOpen: boolean }>`
  width: 20px;
  height: 20px;
  position: relative;
  
  span {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    position: absolute;
    left: 0;
    transition: all 0.3s ease;
    
    &:nth-child(1) {
      top: ${props => props.$isOpen ? '50%' : '25%'};
      transform: ${props => props.$isOpen ? 'translateY(-50%) rotate(45deg)' : 'none'};
    }
    
    &:nth-child(2) {
      top: 50%;
      transform: translateY(-50%);
      opacity: ${props => props.$isOpen ? '0' : '1'};
    }
    
    &:nth-child(3) {
      top: ${props => props.$isOpen ? '50%' : '75%'};
      transform: ${props => props.$isOpen ? 'translateY(-50%) rotate(-45deg)' : 'none'};
    }
  }
`;

export const FloatingEditButton: React.FC<FloatingEditButtonProps> = ({
  isAdmin = false,
  isAuthenticated = false,
  editMode = false,
  commentMode = false,
  onToggleEditMode,
  onToggleCommentMode,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if not logged in or not admin
  if (isLoading) {
    return null;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleEditMode = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onToggleEditMode) {
      onToggleEditMode();
    }
  };

  const handleCommentMode = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onToggleCommentMode) {
      onToggleCommentMode();
    }
  };

  return (
    <FloatingContainer data-admin-control="true">
      <FloatingButton
        onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          setIsOpen(!isOpen);
        }}
        data-testid="floating-edit-button"
        data-admin-control="true"
      >
        <HamburgerIcon $isOpen={isOpen}>
          <span></span>
          <span></span>
          <span></span>
        </HamburgerIcon>
      </FloatingButton>
      
      <AdminPanel $isOpen={isOpen} data-admin-control="true">
        <PanelContent>
          <PanelText>Admin Controls</PanelText>
          <PanelButton onClick={handleEditMode} $isActive={editMode} data-admin-control="true">
            {editMode ? '✓' : '○'} Edit Mode
          </PanelButton>
          <PanelButton onClick={handleCommentMode} $isActive={commentMode} data-admin-control="true">
            {commentMode ? '✓' : '○'} Comment Mode
          </PanelButton>
        </PanelContent>
      </AdminPanel>
    </FloatingContainer>
  );
}; 