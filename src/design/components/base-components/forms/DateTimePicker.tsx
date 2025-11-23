'use client';

import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize } from '../../../system/tokens/tokens';
import { Stack } from '../../../layout/framing/Stack';
import { Input } from './Input';

const DatePickerWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['fullWidth', 'error', 'size', 'isValid'].includes(prop)
})<{ fullWidth: boolean; error: boolean; size: 'sm' | 'md' | 'lg'; isValid?: boolean }>`
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  max-width: 100%; /* Prevent overflow */
  box-sizing: border-box; /* Include padding in width calculation */
  
  /* Ensure inputs are positioned correctly for native pickers on mobile */
  @media (max-width: 768px) {
    /* Prevent inputs from being too far down the page */
    scroll-margin-top: 100px;
    
    /* Ensure proper stacking context */
    z-index: 1;
    
    /* Ensure proper width constraints */
    width: 100%;
    max-width: 100%;
  }
`;

const InputGroup = styled(Stack)`
  gap: ${spacing.md};
  align-items: stretch; /* Ensure children have equal height */
  width: 100%; /* Ensure group takes full width of container */
  max-width: 100%; /* Prevent overflow */
  box-sizing: border-box; /* Include padding in width calculation */
  overflow: visible; /* Allow children to be visible */
  
  /* Stack vertically on very small screens for better mobile UX */
  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${spacing.sm};
  }
  
  /* Ensure proper width constraints on mobile */
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: visible; /* Ensure inputs are visible */
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
  min-width: 0; /* Allow flexbox to shrink properly */
  display: flex;
  flex-direction: column; /* Always stack label above input */
  align-items: stretch; /* Stretch children to full width */
  box-sizing: border-box; /* Include padding in width calculation */

  /* On mobile, adjust flex and width constraints */
  @media (max-width: 768px) {
    flex: 1 1 0; /* Equal flex basis - each wrapper gets 50% minus half the gap */
    min-width: 0; /* Critical: allow flexbox to shrink below content size */
    max-width: calc(50% - 0.375rem); /* 50% minus half of spacing.md (0.75rem / 2) */
    
    /* Ensure input maintains proper dimensions on mobile */
    > input {
      flex: none !important; /* Override Input's flex: 1 when fullWidth */
      flex-shrink: 1 !important; /* Allow input to shrink if needed */
      flex-grow: 0 !important; /* Prevent input from growing */
      width: 100% !important; /* Full width of wrapper */
      min-width: 0 !important; /* Critical: allow flexbox to shrink properly */
      max-width: 100% !important; /* Prevent overflow - critical */
      min-height: 2.5rem; /* Maintain minimum height */
      height: 2.5rem; /* Fixed height for consistency */
      box-sizing: border-box !important; /* Include padding in width calculation - critical */
    }
  }
`;

const InputLabel = styled.label`
  display: block; /* Show on all screen sizes */
  font-size: ${fontSize.xs};
  font-weight: 500;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xs};
`;


const LabelWrapper = styled.label`
  display: block;
  margin-bottom: ${spacing.sm};
  font-size: ${fontSize.sm};
  font-weight: 500;
  color: ${colors.text.primary};
`;

const ValidationIndicator = styled.span<{ $isValid: boolean }>`
  color: ${({ $isValid }) => ($isValid ? colors.success[600] : colors.danger[600])};
  margin-left: 2px;
`;

const HelperText = styled.div`
  margin-top: ${spacing.xs};
  font-size: ${fontSize.xs};
  color: ${colors.text.secondary};
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${colors.text.secondary};
  margin-left: ${spacing.sm};
  flex-shrink: 0;
  pointer-events: none; /* Prevent icon from blocking clicks */
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
  isValid?: boolean; // Whether the field has a valid value
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
  isValid,
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

  // Calculate minimum date/time (24 hours from now)
  // Recalculate on every render to ensure it's always 24 hours from current time
  const minDateTime = useMemo(() => {
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    return minDate;
  }, [dateValue, timeValue]); // Recalculate when date/time changes to keep it current

  // Format min/max dates for native inputs
  // Use provided minDate or default to 24 hours from now
  const effectiveMinDate = minDate || minDateTime;
  const minDateString = `${effectiveMinDate.getFullYear()}-${String(effectiveMinDate.getMonth() + 1).padStart(2, '0')}-${String(effectiveMinDate.getDate()).padStart(2, '0')}`;
  
  // Calculate minimum time dynamically based on selected date
  // If the selected date is the minimum date (tomorrow), restrict time to 24 hours from now
  // If the selected date is later, allow any time
  const minDateOnly = effectiveMinDate.toISOString().slice(0, 10);
  const selectedDateOnly = dateValue || '';
  const isSelectedDateMinDate = selectedDateOnly === minDateOnly;
  const minTimeString = isSelectedDateMinDate ? minDateTime.toTimeString().slice(0, 5) : undefined;
  
  const maxDateString = maxDate
    ? `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`
    : undefined;

  // Validate that selected date/time is at least 24 hours in the future
  const validateDateTime = (dateStr: string, timeStr: string): boolean => {
    if (!dateStr || !timeStr) return false;
    
    const selectedDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    return selectedDateTime >= minDateTime;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // YYYY-MM-DD format
    
    if (!newDate) {
      // If date is cleared, clear the time too and don't call onChange
      if (onChange) {
        onChange('');
      }
      return;
    }
    
    // Check if the new date is the minimum date
    const minDateOnly = effectiveMinDate.toISOString().slice(0, 10);
    const isNewDateMinDate = newDate === minDateOnly;
    
    // If the new date is the minimum date, ensure time is at least the minimum time
    let timeToUse = timeValue || minDateTime.toTimeString().slice(0, 5); // HH:mm format
    if (isNewDateMinDate && timeToUse) {
      const minTime = minDateTime.toTimeString().slice(0, 5);
      // If current time is before minimum time, use minimum time
      if (timeToUse < minTime) {
        timeToUse = minTime;
      }
    }
    
    // Validate the combined date/time
    const isValid = validateDateTime(newDate, timeToUse);
    
    // Combine date + time into ISO format
    const combined = `${newDate}T${timeToUse}`;
    if (onChange) {
      onChange(combined);
    }
    
    // Set error state if validation fails
    if (!isValid && error !== undefined) {
      // Error will be handled by parent component
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value; // HH:mm format
    
    if (!newTime) {
      // If time is cleared but date exists, keep date with minimum time
      if (dateValue && onChange) {
        const minTime = minDateTime.toTimeString().slice(0, 5);
        onChange(`${dateValue}T${minTime}`);
      }
      return;
    }
    
    // Combine with existing date or use minimum date (24 hours from now)
    const dateToUse = dateValue || minDateTime.toISOString().slice(0, 10); // YYYY-MM-DD format
    
    // Check if the selected date is the minimum date
    const minDateOnly = effectiveMinDate.toISOString().slice(0, 10);
    const isSelectedDateMinDate = dateToUse === minDateOnly;
    
    // If the selected date is the minimum date, enforce minimum time
    let timeToUse = newTime;
    if (isSelectedDateMinDate) {
      const minTime = minDateTime.toTimeString().slice(0, 5); // HH:mm format
      // If the selected time is before the minimum time, use the minimum time
      if (newTime < minTime) {
        timeToUse = minTime;
      }
    }
    
    // Validate the combined date/time
    const isValid = validateDateTime(dateToUse, timeToUse);
    
    // Combine date + time into ISO format
    const combined = `${dateToUse}T${timeToUse}`;
    if (onChange) {
      onChange(combined);
    }
    
    // Set error state if validation fails
    if (!isValid && error !== undefined) {
      // Error will be handled by parent component
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
    }
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

    const handleFocus = (e: Event) => {
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
          {required && (
            <ValidationIndicator $isValid={isValid ?? (!!value && !error)}>
              {isValid ?? (!!value && !error) ? ' ✓' : ' *'}
            </ValidationIndicator>
          )}
        </LabelWrapper>
      )}
      
      <InputGroup direction="horizontal" spacing="md">
        {/* Date Input - Native HTML5 */}
        <InputWrapper ref={dateInputWrapperRef}>
          <InputLabel htmlFor={`${id}-date`}>
            Date
          </InputLabel>
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
            placeholder="Date"
            title={isMobileDevice ? "Date - Tap to select pickup date" : "Select date"}
            aria-label="Select date"
            data-testid={cmsId ? `${cmsId}-date` : `${id}-date`}
          />
        </InputWrapper>

        {/* Time Input - Native HTML5 */}
        <InputWrapper ref={timeInputWrapperRef}>
          <InputLabel htmlFor={`${id}-time`}>
            Time
          </InputLabel>
          <Input
            id={`${id}-time`}
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={disabled}
            min={isSelectedDateMinDate ? minTimeString : undefined}
            tabIndex={isMobileDevice && !allowTimeFocus ? -1 : 0} // Remove from tab order on mobile until allowed
            required={required}
            error={error}
            size={size}
            fullWidth={true}
            step={900} // 15 minute intervals
            placeholder="Time"
            title={isMobileDevice ? "Time - Tap to select pickup time" : "Select time"}
            aria-label="Select time"
            data-testid={cmsId ? `${cmsId}-time` : `${id}-time`}
          />
        </InputWrapper>
      </InputGroup>
      
      {/* Helper text showing 24-hour notice requirement */}
      {required && (
        <HelperText>
          Please book at least 24 hours in advance
        </HelperText>
      )}
    </DatePickerWrapper>
  );
};
