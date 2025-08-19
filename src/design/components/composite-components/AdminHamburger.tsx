'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Text } from '../base-components/text/Text';
import { Button } from '../base-components/Button';
import { FlexboxContainer } from '../base-components/FlexboxContainer';
import { colors, spacing, shadows, zIndex } from '../../system/tokens/tokens';

interface FloatingEditButtonProps {
  editMode?: boolean;
  commentMode?: boolean;
  onToggleEditMode?: () => void;
  onToggleCommentMode?: () => void;
}

// Floating container - needs fixed positioning for global access
const FloatingContainer = styled(FlexboxContainer)`
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: ${zIndex.dropdown};
`;

// Floating button with flexbox-based styling
const FloatingButton = styled(Button)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: ${shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Admin panel - uses flexbox with limited absolute positioning for dropdown
const AdminPanel = styled(FlexboxContainer)<{ $isOpen: boolean }>`
  position: absolute;
  top: 60px;
  right: 0;
  background: ${colors.background.primary};
  border: 1px solid ${colors.border.default};
  border-radius: 8px;
  padding: ${spacing.md};
  min-width: 200px;
  box-shadow: ${shadows.md};
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  border-top: 1px solid ${colors.border.default};
  z-index: ${zIndex.dropdown + 1};
  flex-direction: column;
  gap: ${spacing.sm};
`;

// Panel content - flexbox-based layout
const PanelContent = styled(FlexboxContainer)`
  flex-direction: column;
  gap: ${spacing.sm};
`;

// Panel text with flexbox-based styling
const PanelText = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.sm};
  display: flex;
  align-items: center;
`;

// Panel button with flexbox-based styling
const PanelButton = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  padding: ${spacing.sm} ${spacing.md};
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: ${colors.text.primary};
  background-color: ${props => props.$isActive ? colors.primary[600] : 'transparent'};
  color: ${props => props.$isActive ? colors.text.white : colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.$isActive ? colors.primary[600] : colors.background.secondary};
  }
`;

// Divider with flexbox-based styling
const Divider = styled.div`
  height: 1px;
  background: ${colors.border.default};
  margin: ${spacing.sm} 0;
  align-self: stretch;
`;

// Hamburger icon with flexbox-based animation
const HamburgerIcon = styled(FlexboxContainer)<{ $isOpen: boolean }>`
  width: 20px;
  height: 20px;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
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

export const AdminHamburger: React.FC<FloatingEditButtonProps> = ({
  editMode = false,
  commentMode = false,
  onToggleEditMode,
  onToggleCommentMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
    <FloatingContainer 
      data-admin-control="true"
      direction="column"
      align="flex-end"
    >
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
      
      <AdminPanel 
        $isOpen={isOpen} 
        data-admin-control="true"
        direction="column"
        align="stretch"
      >
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