'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useInteractionMode } from '../../providers/InteractionModeProvider';
import { colors, spacing, shadows, zIndex } from '../../system/tokens/tokens';

// Floating Action Button Container
const FABContainer = styled.div`
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: ${zIndex.modal};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${spacing.sm};
`;

// Main hamburger button
const HamburgerButton = styled.button<{ $isOpen: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${colors.primary[600]};
  border: none;
  cursor: pointer;
  box-shadow: ${shadows.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.primary[700]};
    transform: scale(1.05);
  }
  
  svg {
    width: 24px;
    height: 24px;
    fill: white;
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
  }
`;

// Menu items container
const MenuItems = styled.div<{ $isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(20px)'};
  transition: all 0.3s ease;
  pointer-events: ${({ $isOpen }) => $isOpen ? 'auto' : 'none'};
`;

// Individual menu item
const MenuItem = styled.div<{ $isActive?: boolean }>`
  background: ${({ $isActive }) => $isActive ? colors.primary[600] : colors.background.primary};
  color: ${({ $isActive }) => $isActive ? 'white' : colors.text.primary};
  border: 1px solid ${colors.border.default};
  border-radius: 28px;
  padding: ${spacing.sm} ${spacing.md};
  box-shadow: ${shadows.md};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: ${({ $isActive }) => $isActive ? colors.primary[700] : colors.background.secondary};
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

// Icons
const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 12h18M3 6h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function ModeToggleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { editMode, toggleEditMode } = useInteractionMode();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleEditModeToggle = () => {
    toggleEditMode();
    setIsOpen(false); // Close menu after selection
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-mode-menu]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <FABContainer data-mode-menu>
      <MenuItems $isOpen={isOpen}>
        <MenuItem
          $isActive={editMode}
          onClick={handleEditModeToggle}
          title="Toggle edit mode to modify page content"
        >
          ✏️ {editMode ? 'Exit Edit' : 'Edit Content'}
        </MenuItem>
      </MenuItems>

      <HamburgerButton
        $isOpen={isOpen}
        onClick={handleToggle}
        title="Toggle mode menu"
        aria-label="Mode toggle menu"
      >
        <HamburgerIcon />
      </HamburgerButton>
    </FABContainer>
  );
}

// Standalone version for use outside of providers
export function ModeToggleMenuStandalone() {
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleEditModeToggle = () => {
    setEditMode(!editMode);
    setIsOpen(false);
    // You might want to dispatch a custom event here for edit mode
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-mode-menu]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <FABContainer data-mode-menu>
      <MenuItems $isOpen={isOpen}>
        <MenuItem
          $isActive={editMode}
          onClick={handleEditModeToggle}
          title="Toggle edit mode to modify page content"
        >
          ✏️ {editMode ? 'Exit Edit' : 'Edit Content'}
        </MenuItem>
      </MenuItems>

      <HamburgerButton
        $isOpen={isOpen}
        onClick={handleToggle}
        title="Toggle mode menu"
        aria-label="Mode toggle menu"
      >
        <HamburgerIcon />
      </HamburgerButton>
    </FABContainer>
  );
}
