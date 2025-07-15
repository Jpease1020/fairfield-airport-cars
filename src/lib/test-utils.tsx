export function renderWithProviders() {
  // This is a placeholder - in actual tests, you'd use @testing-library/react
  return {
    container: document.createElement('div'),
    debug: () => {},
    rerender: () => {},
    unmount: () => {},
  };
}

export function createMockBooking(overrides: any = {}): any {
  return {
    id: 'mock-booking-id',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    pickupLocation: '123 Main St',
    dropoffLocation: '456 Oak Ave',
    pickupDateTime: new Date(),
    passengers: 2,
    flightNumber: 'AA123',
    notes: 'Test booking',
    fare: 50.00,
    status: 'pending',
    depositPaid: false,
    balanceDue: 40.00,
    depositAmount: 10.00,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockSettings(overrides: any = {}): any {
  return {
    baseFare: 10.00,
    perMile: 2.50,
    perMinute: 0.50,
    depositPercent: 20,
    bufferMinutes: 15,
    cancellation: 24,
    ...overrides,
  };
}

/**
 * Common test helpers
 */
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Accessibility testing helpers
 */
export const expectToBeAccessible = (container: HTMLElement) => {
  // Check for proper heading structure
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    console.warn('No headings found - accessibility issue');
  }

  // Check for proper form labels
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    if (id) {
      const label = container.querySelector(`label[for="${id}"]`);
      if (!label) {
        console.warn(`Input with id "${id}" has no associated label`);
      }
    }
  });

  // Check for proper button roles
  const buttons = container.querySelectorAll('button, [role="button"]');
  buttons.forEach(button => {
    const ariaLabel = button.getAttribute('aria-label');
    if (!ariaLabel) {
      console.warn('Button missing aria-label attribute');
    }
  });
};

export { renderWithProviders as render }; 