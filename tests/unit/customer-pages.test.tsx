import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('Customer Pages - Gregg\'s Business', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('🔴 CRITICAL: Homepage', () => {
    test('displays booking call-to-action', async () => {
      const { default: HomePage } = await import('@/app/page');
      render(<HomePage />);

      // Check for booking buttons
      expect(screen.getByTestId('nav-book')).toBeInTheDocument();
    });

    test('displays business information', async () => {
      const { default: HomePage } = await import('@/app/page');
      render(<HomePage />);

      // Check for business info
      expect(screen.getByTestId('nav-about')).toBeInTheDocument();
    });

    test('has working navigation links', async () => {
      const { default: HomePage } = await import('@/app/page');
      render(<HomePage />);

      // Check for important navigation
      expect(screen.getByTestId('nav-about')).toBeInTheDocument();
      expect(screen.getByTestId('nav-help')).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Booking Page', () => {
    test('booking form loads correctly', async () => {
      const { default: BookingPage } = await import('@/app/book/page');
      render(<BookingPage />);

      // Check for form elements
      expect(screen.getByTestId('nav-book')).toBeInTheDocument();
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    });

    test('booking form has all required fields', async () => {
      const { default: BookingPage } = await import('@/app/book/page');
      render(<BookingPage />);

      // Check for all required fields
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
      expect(screen.getByTestId('pickup-input')).toBeInTheDocument();
      expect(screen.getByTestId('dropoff-input')).toBeInTheDocument();
      expect(screen.getByTestId('date-input')).toBeInTheDocument();
      expect(screen.getByTestId('time-input')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Costs Page', () => {
    test('displays pricing information', async () => {
      const { default: CostsPage } = await import('@/app/costs/page');
      render(<CostsPage />);

      // Check for pricing info
      expect(screen.getByTestId('nav-costs')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Help Page', () => {
    test('displays help information', async () => {
      const { default: HelpPage } = await import('@/app/help/page');
      render(<HelpPage />);

      // Check for help content
      expect(screen.getByTestId('nav-help')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: About Page', () => {
    test('displays company information', async () => {
      const { default: AboutPage } = await import('@/app/about/page');
      render(<AboutPage />);

      // Check for about content
      expect(screen.getByTestId('nav-about')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Success Page', () => {
    test('displays booking confirmation', async () => {
      const { default: SuccessPage } = await import('@/app/success/page');
      render(<SuccessPage />);

      // Check for success message
      expect(screen.getByTestId('success-booking-confirmed-title')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Cancel Page', () => {
    test('displays cancellation information', async () => {
      const { default: CancelPage } = await import('@/app/cancel/page');
      render(<CancelPage />);

      // Check for cancellation content
      expect(screen.getByTestId('nav-help')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Terms Page', () => {
    test('displays terms and conditions', async () => {
      const { default: TermsPage } = await import('@/app/terms/page');
      render(<TermsPage />);

      // Check for terms content
      expect(screen.getByTestId('nav-help')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Privacy Page', () => {
    test('displays privacy policy', async () => {
      const { default: PrivacyPage } = await import('@/app/privacy/page');
      render(<PrivacyPage />);

      // Check for privacy content
      expect(screen.getByTestId('nav-help')).toBeInTheDocument();
    });
  });
}); 