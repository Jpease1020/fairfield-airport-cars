'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '@/design/components/base-components/Button';
import { Stack } from '@/design/layout/framing/Stack';
import { Box } from '@/design/layout/content/Box';
import { Text } from '@/design/components/base-components/text/Text';
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  downloadIcsFile,
  markCalendarAsAdded,
  createCalendarEventData,
} from '@/lib/utils/calendar-utils';
import { colors, spacing, shadows, borderRadius } from '@/design/system/tokens/tokens';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled(Box)<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: ${spacing.xs};
  min-width: 200px;
  background-color: ${colors.background.primary};
  border: 1px solid ${colors.border.default};
  border-radius: ${borderRadius.default};
  box-shadow: ${shadows.lg};
  z-index: 1000;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  padding: ${spacing.sm};
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: ${spacing.md};
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: ${borderRadius.sm};
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  color: ${colors.text.primary};
  font-size: inherit;
  font-family: inherit;

  &:hover {
    background-color: ${colors.background.secondary};
  }

  &:active {
    background-color: ${colors.background.tertiary};
  }
`;

interface AddToCalendarButtonProps {
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: string | Date;
  bookingId: string;
  customerName?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  pickupAddress,
  dropoffAddress,
  pickupDateTime,
  bookingId,
  customerName,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCalendarAction = async (action: 'google' | 'outlook' | 'ics') => {
    try {
      const eventData = createCalendarEventData(
        pickupAddress,
        dropoffAddress,
        pickupDateTime,
        bookingId,
        customerName
      );

      // Mark as added in localStorage and server
      await markCalendarAsAdded(bookingId);

      if (action === 'google') {
        const url = generateGoogleCalendarUrl(eventData);
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (action === 'outlook') {
        const url = generateOutlookCalendarUrl(eventData);
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (action === 'ics') {
        await downloadIcsFile(eventData);
      }

      // Close dropdown
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('Failed to add to calendar. Please try again.');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-calendar-dropdown]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <DropdownContainer data-calendar-dropdown>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={() => setIsOpen(!isOpen)}
        data-testid="add-to-calendar-button"

        text="📅 Add to Calendar"
      />
      <DropdownMenu $isOpen={isOpen} variant="elevated">
        <Stack spacing="xs">
          <DropdownItem
            onClick={() => handleCalendarAction('google')}
            data-testid="add-to-google-calendar"
          >
            <span>📅</span>
            <Text size="sm">Google Calendar</Text>
          </DropdownItem>
          <DropdownItem
            onClick={() => handleCalendarAction('outlook')}
            data-testid="add-to-outlook-calendar"
          >
            <span>📧</span>
            <Text size="sm">Outlook / Microsoft Teams</Text>
          </DropdownItem>
          <DropdownItem
            onClick={() => handleCalendarAction('ics')}
            data-testid="download-ics-file"
          >
            <span>🍎</span>
            <Text size="sm">Download .ics (Apple Calendar)</Text>
          </DropdownItem>
        </Stack>
      </DropdownMenu>
    </DropdownContainer>
  );
};

