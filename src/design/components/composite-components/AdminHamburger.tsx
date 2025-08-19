'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useInteractionMode } from '../../providers/InteractionModeProvider';
import { useDemoMode } from '../../../hooks/useDemoMode';

const AdminHamburgerContainer = styled.div`
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 10000;
`;

const AdminHamburgerButton = styled.button<{ $isOpen: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--background-card);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  span {
    display: block;
    width: 20px;
    height: 2px;
    background: currentColor;
    position: absolute;
    left: 15px;
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

const AdminHamburgerPanel = styled.div`
  position: absolute;
  top: 60px;
  right: 0;
  background: var(--background-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-top: 1px solid var(--border-color);
  z-index: 10001;
`;

const PanelText = styled.div`
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
  width: 100%;
  margin-bottom: 4px;

  &:hover {
    background-color: ${props => props.$isActive ? 'var(--primary-color)' : 'var(--background-secondary)'};
  }
`;

export const AdminHamburger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { editMode, commentMode, setEditMode, setCommentMode } = useInteractionMode();
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const handleEditMode = () => {
    setEditMode(!editMode);
    if (commentMode) setCommentMode(false);
  };

  const handleCommentMode = () => {
    setCommentMode(!commentMode);
    if (editMode) setEditMode(false);
  };

  const handleDemoMode = async () => {
    await toggleDemoMode(!isDemoMode);
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('[data-testid="admin-hamburger-container"]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <AdminHamburgerContainer data-testid="admin-hamburger-container">
      <AdminHamburgerButton
        onClick={() => setIsOpen(!isOpen)}
        $isOpen={isOpen}
        data-testid="admin-hamburger-button"
      >
        <span></span>
        <span></span>
        <span></span>
      </AdminHamburgerButton>

      {isOpen && (
        <AdminHamburgerPanel data-testid="admin-hamburger-panel">
          <PanelText>Admin Controls</PanelText>
          <PanelButton onClick={handleEditMode} $isActive={editMode} data-admin-control="true">
            {editMode ? '✓' : '○'} Edit Copy
          </PanelButton>
          <PanelButton onClick={handleCommentMode} $isActive={commentMode} data-admin-control="true">
            {commentMode ? '✓' : '○'} Comment Mode
          </PanelButton>
          <PanelButton onClick={handleDemoMode} $isActive={isDemoMode} data-admin-control="true">
            {isDemoMode ? '✓' : '○'} Demo Mode
          </PanelButton>
        </AdminHamburgerPanel>
      )}
    </AdminHamburgerContainer>
  );
}; 