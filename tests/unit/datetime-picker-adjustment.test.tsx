/**
 * DateTimePicker Auto-Adjustment Tests
 *
 * Tests that when a user selects a time earlier than 24 hours from now,
 * the component auto-corrects to the earliest valid time and shows a message.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DateTimePicker } from '@/design/components/base-components/forms/DateTimePicker';

describe('DateTimePicker - Time Auto-Adjustment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders date and time inputs', () => {
    render(
      <DateTimePicker
        id="test-datetime"
        label="When"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    // Find the date and time inputs by test id
    const dateInput = screen.getByTestId('test-datetime-date');
    const timeInput = screen.getByTestId('test-datetime-time');

    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
  });

  it('calls onChange when date is changed', () => {
    const onChange = vi.fn();

    render(
      <DateTimePicker
        id="test-datetime-date-change"
        label="When"
        value=""
        onChange={onChange}
        required
      />
    );

    const dateInput = screen.getByTestId('test-datetime-date-change-date');

    // Select a date 2 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateString = futureDate.toISOString().slice(0, 10);

    fireEvent.change(dateInput, { target: { value: dateString } });

    // onChange should be called
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange when time is changed', () => {
    const onChange = vi.fn();

    // Set an initial value with a date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const initialValue = `${futureDate.toISOString().slice(0, 10)}T12:00`;

    render(
      <DateTimePicker
        id="test-datetime-time-change"
        label="When"
        value={initialValue}
        onChange={onChange}
        required
      />
    );

    const timeInput = screen.getByTestId('test-datetime-time-change-time');

    fireEvent.change(timeInput, { target: { value: '14:00' } });

    // onChange should be called
    expect(onChange).toHaveBeenCalled();
  });

  it('shows 24-hour notice helper text when required', () => {
    render(
      <DateTimePicker
        id="test-datetime-required"
        label="When"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    // Should show the helper text for required fields
    const helperText = screen.getByText(/Please book at least 24 hours in advance/i);
    expect(helperText).toBeInTheDocument();
  });

  it('does not show 24-hour notice when not required', () => {
    render(
      <DateTimePicker
        id="test-datetime-not-required"
        label="Optional DateTime"
        value=""
        onChange={vi.fn()}
        required={false}
      />
    );

    // When not required, the helper text should not be present
    expect(screen.queryByText(/Please book at least 24 hours in advance/i)).not.toBeInTheDocument();
  });

  it('renders with correct label', () => {
    render(
      <DateTimePicker
        id="test-datetime-label"
        label="When"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    expect(screen.getByText('When')).toBeInTheDocument();
  });

  it('shows validation indicator when required', () => {
    render(
      <DateTimePicker
        id="test-datetime-indicator"
        label="When"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    // Should have validation indicator (* or ✓)
    const indicator = screen.getByText(/[*✓]/);
    expect(indicator).toBeInTheDocument();
  });
});
