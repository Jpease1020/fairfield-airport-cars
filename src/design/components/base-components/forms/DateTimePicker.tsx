'use client';

import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize } from '../../../system/tokens/tokens';
import { Stack } from '../../../layout/framing/Stack';
import { Input } from './Input';

const DatePickerWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['fullWidth', 'error', 'size'].includes(prop)
})<{ fullWidth: boolean; error: boolean; size: 'sm' | 'md' | 'lg' }>`
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  /* Ensure inputs are positioned correctly for native pickers on mobile */
  @media (max-width: 768px) {
    /* Prevent inputs from being too far down the page */
    scroll-margin-top: 100px;
    
    /* Ensure proper stacking context */
    z-index: 1;
  }
`;

const InputGroup = styled(Stack)`
  gap: ${spacing.md};
  align-items: stretch; /* Ensure children have equal height */
  
  /* Stack vertically on very small screens for better mobile UX */
  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${spacing.sm};
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
  min-width: 0; /* Allow flexbox to shrink properly */
  display: flex;
  
  /* Ensure equal width on mobile */
  @media (max-width: 768px) {
    flex: 1 1 0; /* Equal flex basis for equal widths */
    min-width: 0;
  }
`;

export interface DateTimePickerProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string; // ISO string format (YYYY-MM-DDTHH:mm)
  onChange?: (dateTime: string) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
  cmsId?: string;
  [key: string]: any;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  id,
  label,
  placeholder = 'mm/dd/yyyy, --:-- --',
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  required = false,
  cmsId,
  ...rest
}) => {
  // Parse ISO string into date and time strings for native inputs
  // Native inputs expect: date="YYYY-MM-DD", time="HH:mm"
  const { dateValue, timeValue } = useMemo(() => {
    if (!value) return { dateValue: '', timeValue: '' };
    
    try {
      // Remove 'Z' if present and parse
      const date = new Date(value.replace('Z', ''));
      
      // Format date as YYYY-MM-DD for native date input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateValue = `${year}-${month}-${day}`;
      
      // Format time as HH:mm for native time input
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const timeValue = `${hours}:${minutes}`;
      
      return { dateValue, timeValue };
    } catch {
      return { dateValue: '', timeValue: '' };
    }
  }, [value]);

  // Detect if device is mobile (iOS Safari, Android Chrome, etc.)
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      // Check screen width
      const isSmallScreen = window.innerWidth < 768;
      
      // Check user agent for mobile devices
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobileUA = /iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(userAgent);
      
      // Check for touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobileDevice(isSmallScreen && (isMobileUA || isTouchDevice));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Format min/max dates for native inputs
  const minDateString = minDate
    ? `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`
    : undefined;
  
  const maxDateString = maxDate
    ? `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`
    : undefined;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // YYYY-MM-DD format
    
    if (!newDate) {
      // If date is cleared, clear the time too and don't call onChange
      if (onChange) {
        onChange('');
      }
      return;
    }
    
    // Combine with existing time or use current time
    const timeToUse = timeValue || new Date().toTimeString().slice(0, 5); // HH:mm format
    
    // Combine date + time into ISO format
    const combined = `${newDate}T${timeToUse}`;
    if (onChange) {
      onChange(combined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value; // HH:mm format
    
    if (!newTime) {
      // If time is cleared but date exists, keep date with empty time
      if (dateValue && onChange) {
        onChange(`${dateValue}T00:00`);
      }
      return;
    }
    
    // Combine with existing date or use today
    const dateToUse = dateValue || new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    
    // Combine date + time into ISO format
    const combined = `${dateToUse}T${newTime}`;
    if (onChange) {
      onChange(combined);
    }
  };

  // Prevent iOS Safari from auto-opening time picker when typing in other fields
  // Simple approach: Remove from tab order and prevent focus unless explicitly clicked
  const [allowTimeFocus, setAllowTimeFocus] = useState(!isMobileDevice);
  const timeInputWrapperRef = React.useRef<HTMLDivElement>(null);
  const dateInputWrapperRef = React.useRef<HTMLDivElement>(null);

  // Reset allowFocus when time value changes (user has selected a time)
  useEffect(() => {
    if (timeValue && isMobileDevice) {
      setAllowTimeFocus(true); // Allow focus after time is selected
    }
  }, [timeValue, isMobileDevice]);

  // Scroll input into view when focused (ensures native picker appears on screen)
  // This function is defined with useCallback to ensure it has access to the latest isMobileDevice value
  const scrollInputIntoView = React.useCallback((input: HTMLInputElement) => {
    if (!isMobileDevice) return;
    
    // Use requestAnimationFrame to ensure DOM is ready, then scroll
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
      const inputRect = input.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Target position: 120px from top of viewport (leaves room for header/navigation)
      const targetTop = 120;
      const currentTop = inputRect.top;
      
      // Only scroll if input is not already well-positioned
      // Check if input is too high (above target) or too low (below middle of viewport)
      if (currentTop < 50 || currentTop > viewportHeight / 2) {
        const scrollAmount = currentTop - targetTop;
        window.scrollTo({
          top: window.scrollY + scrollAmount,
          behavior: 'smooth'
        });
      }
    });
  }, [isMobileDevice]);

  // Handle date input focus - scroll into view
  useEffect(() => {
    if (!dateInputWrapperRef.current || !isMobileDevice) return;

    const dateInput = dateInputWrapperRef.current.querySelector('input[type="date"]') as HTMLInputElement;
    if (!dateInput) return;

    const handleDateFocus = () => {
      scrollInputIntoView(dateInput);
    };

    dateInput.addEventListener('focus', handleDateFocus);

    return () => {
      dateInput.removeEventListener('focus', handleDateFocus);
    };
  }, [isMobileDevice, scrollInputIntoView]);

  // Prevent focus on time input unless explicitly allowed
  // Only attach listeners to the time input itself, don't interfere with other inputs
  useEffect(() => {
    if (!timeInputWrapperRef.current || !isMobileDevice) return;

    const timeInput = timeInputWrapperRef.current.querySelector('input[type="time"]') as HTMLInputElement;
    if (!timeInput) return;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Only prevent focus if it's not explicitly allowed
      if (!allowTimeFocus) {
        e.preventDefault();
        e.stopPropagation();
        timeInput.blur();
        // Don't try to restore focus - let the browser handle it naturally
      } else {
        // If focus is allowed, scroll into view
        scrollInputIntoView(timeInput);
      }
    };

    // Allow focus when user explicitly clicks/touches the time input
    const handlePointerDown = (e: Event) => {
      // Only enable if the event target is the time input itself
      if (e.target === timeInput) {
        setAllowTimeFocus(true);
      }
    };

    // Only listen to events on the time input itself
    timeInput.addEventListener('focus', handleFocus, true);
    timeInput.addEventListener('mousedown', handlePointerDown);
    timeInput.addEventListener('touchstart', handlePointerDown);

    return () => {
      timeInput.removeEventListener('focus', handleFocus, true);
      timeInput.removeEventListener('mousedown', handlePointerDown);
      timeInput.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isMobileDevice, allowTimeFocus, scrollInputIntoView]);

  return (
    <DatePickerWrapper 
      fullWidth={fullWidth} 
      error={error} 
      size={size}
      data-testid={cmsId}
    >
      {label && (
        <LabelWrapper htmlFor={id}>
          {label}
          {required && <RequiredAsterisk> *</RequiredAsterisk>}
        </LabelWrapper>
      )}
      
      <InputGroup direction="horizontal" spacing="md">
        {/* Date Input - Native HTML5 */}
        <InputWrapper ref={dateInputWrapperRef}>
          <Input
            id={`${id}-date`}
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            min={minDateString}
            max={maxDateString}
            disabled={disabled}
            required={required}
            error={error}
            size={size}
            fullWidth={true}
            placeholder="mm/dd/yyyy"
            aria-label="Select date"
            data-testid={cmsId ? `${cmsId}-date` : `${id}-date`}
          />
          {/* Custom calendar icon for iOS - ONLY show on mobile devices when empty */}
          {isMobileDevice && !dateValue && (
            <span
              style={{
                position: 'absolute',
                right: '40px', // Leave room for native picker indicator
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                fontSize: '16px',
                color: colors.text.secondary,
                zIndex: 1,
              }}
              aria-hidden="true"
            >
              📅
            </span>
          )}
        </InputWrapper>

        {/* Time Input - Native HTML5 */}
        <InputWrapper ref={timeInputWrapperRef}>
          <Input
            id={`${id}-time`}
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={disabled}
            tabIndex={isMobileDevice && !allowTimeFocus ? -1 : 0} // Remove from tab order on mobile until allowed
            required={required}
            error={error}
            size={size}
            fullWidth={true}
            step={900} // 15 minute intervals
            placeholder="--:--"
            aria-label="Select time"
            data-testid={cmsId ? `${cmsId}-time` : `${id}-time`}
          />
          {/* Custom clock icon for iOS - ONLY show on mobile devices when empty */}
          {isMobileDevice && !timeValue && (
            <span
              style={{
                position: 'absolute',
                right: '40px', // Leave room for native picker indicator
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                fontSize: '16px',
                color: colors.text.secondary,
                zIndex: 1,
              }}
              aria-hidden="true"
            >
              🕐
            </span>
          )}
        </InputWrapper>
      </InputGroup>
    </DatePickerWrapper>
  );
};
