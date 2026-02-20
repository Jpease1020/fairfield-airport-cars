/**
 * ContactInfoPhase integration tests (Phase 3.11)
 * Toggle "Save my information" and "Send me deals" and assert state and callback payloads.
 */
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ContactInfoPhase } from '@/components/booking/ContactInfoPhase';
import type { CustomerInfo, ValidationResult } from '@/types/booking';

vi.mock('@/design/providers/CMSDataProvider', () => ({
  useCMSData: () => ({ cmsData: { booking: {} } }),
}));

vi.mock('@/providers/BookingProvider', () => ({
  useBooking: () => ({ hasAttemptedValidation: false }),
}));

// Prevent fetch calls from hooks leaking into this test
vi.mock('@/hooks/useFareCalculation', () => ({
  useFareCalculation: () => ({ fare: null, isCalculating: false, error: null }),
}));

const defaultCustomer: CustomerInfo = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '2035551234',
  notes: '',
  saveInfoForFuture: false,
  smsOptIn: false,
};

const defaultValidation: ValidationResult = {
  isValid: true,
  errors: [],
  fieldErrors: {},
  warnings: [],
};

function renderContactInfoPhase(props: Partial<{
  customerData: CustomerInfo;
  onCustomerUpdate: (data: Partial<CustomerInfo>) => void;
  validation: ValidationResult;
}> = {}) {
  const onCustomerUpdate = props.onCustomerUpdate ?? vi.fn();
  const initialData = props.customerData ?? defaultCustomer;
  render(
    <ContactInfoPhase
      customerData={initialData}
      onCustomerUpdate={onCustomerUpdate}
      onBack={vi.fn()}
      onContinue={vi.fn()}
      validation={props.validation ?? defaultValidation}
      cmsData={{}}
    />
  );
  return { onCustomerUpdate };
}

/** Wrapper that holds customer state so toggles reflect in next click (simulates parent/BookingProvider). */
function renderContactInfoPhaseWithState(initial: CustomerInfo = defaultCustomer) {
  const onCustomerUpdate = vi.fn();
  function Wrapper() {
    const [customerData, setCustomerData] = useState<CustomerInfo>(initial);
    const handleUpdate = (data: Partial<CustomerInfo>) => {
      onCustomerUpdate(data);
      setCustomerData((prev) => ({ ...prev, ...data }));
    };
    return (
      <ContactInfoPhase
        customerData={customerData}
        onCustomerUpdate={handleUpdate}
        onBack={vi.fn()}
        onContinue={vi.fn()}
        validation={defaultValidation}
        cmsData={{}}
      />
    );
  }
  render(<Wrapper />);
  return { onCustomerUpdate };
}

describe('ContactInfoPhase - Save my info and SMS opt-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('toggles Save my information and calls onCustomerUpdate with correct payload', () => {
    const { onCustomerUpdate } = renderContactInfoPhaseWithState();

    const saveInfoRadio = screen.getByRole('radio', { name: /save my information for future bookings/i });

    fireEvent.click(saveInfoRadio);
    expect(onCustomerUpdate).toHaveBeenLastCalledWith({ saveInfoForFuture: true });

    fireEvent.click(saveInfoRadio);
    expect(onCustomerUpdate).toHaveBeenLastCalledWith({ saveInfoForFuture: false });
  });

  it('toggles Send me deals (SMS opt-in) and calls onCustomerUpdate with correct payload', () => {
    const { onCustomerUpdate } = renderContactInfoPhaseWithState();

    const smsOptInRadio = screen.getByRole('radio', { name: /I agree to receive SMS messages/i });

    fireEvent.click(smsOptInRadio);
    expect(onCustomerUpdate).toHaveBeenLastCalledWith({ smsOptIn: true });

    fireEvent.click(smsOptInRadio);
    expect(onCustomerUpdate).toHaveBeenLastCalledWith({ smsOptIn: false });
  });

  it('toggling both options repeatedly calls onCustomerUpdate with correct payloads', () => {
    const { onCustomerUpdate } = renderContactInfoPhaseWithState();

    const saveInfo = screen.getByRole('radio', { name: /save my information for future bookings/i });
    const smsOptIn = screen.getByRole('radio', { name: /I agree to receive SMS messages/i });

    fireEvent.click(saveInfo);
    fireEvent.click(smsOptIn);
    fireEvent.click(saveInfo);
    fireEvent.click(smsOptIn);

    expect(onCustomerUpdate).toHaveBeenCalledWith({ saveInfoForFuture: true });
    expect(onCustomerUpdate).toHaveBeenCalledWith({ saveInfoForFuture: false });
    expect(onCustomerUpdate).toHaveBeenCalledWith({ smsOptIn: true });
    expect(onCustomerUpdate).toHaveBeenCalledWith({ smsOptIn: false });
  });

  it('reflects initial saveInfoForFuture and smsOptIn (clicking once toggles off when initial is true)', () => {
    const { onCustomerUpdate } = renderContactInfoPhaseWithState({
      ...defaultCustomer,
      saveInfoForFuture: true,
      smsOptIn: true,
    });

    const saveInfoRadio = screen.getByRole('radio', { name: /save my information for future bookings/i });
    const smsOptInRadio = screen.getByRole('radio', { name: /I agree to receive SMS messages/i });

    fireEvent.click(saveInfoRadio);
    expect(onCustomerUpdate).toHaveBeenLastCalledWith({ saveInfoForFuture: false });
    fireEvent.click(smsOptInRadio);
    expect(onCustomerUpdate).toHaveBeenLastCalledWith({ smsOptIn: false });
  });
});
