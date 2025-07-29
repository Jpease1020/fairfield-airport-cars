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

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
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

describe('Admin Pages - Gregg\'s Business Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('🔴 CRITICAL: Admin Login Page', () => {
    test('displays login form', async () => {
      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Check for login form elements
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    test('has Google sign-in option', async () => {
      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Check for Google sign-in
      expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Admin Dashboard', () => {
    test('displays admin dashboard', async () => {
      const { default: AdminDashboard } = await import('@/app/admin/page');
      render(<AdminDashboard />);

      // Check for dashboard elements
      expect(screen.getByTestId('admin-nav-bookings')).toBeInTheDocument();
      expect(screen.getByTestId('admin-nav-drivers')).toBeInTheDocument();
    });

    test('has navigation menu', async () => {
      const { default: AdminDashboard } = await import('@/app/admin/page');
      render(<AdminDashboard />);

      // Check for navigation
      expect(screen.getByTestId('admin-nav-bookings')).toBeInTheDocument();
      expect(screen.getByTestId('admin-nav-drivers')).toBeInTheDocument();
      expect(screen.getByTestId('admin-nav-calendar')).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Bookings Management', () => {
    test('displays bookings page', async () => {
      const { default: BookingsPage } = await import('@/app/admin/bookings/page');
      render(<BookingsPage />);

      // Check for bookings content
      expect(screen.getByTestId('admin-nav-bookings')).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Drivers Management', () => {
    test('displays drivers page', async () => {
      const { default: DriversPage } = await import('@/app/admin/drivers/page');
      render(<DriversPage />);

      // Check for drivers content
      expect(screen.getByTestId('admin-nav-drivers')).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Payments Management', () => {
    test('displays payments page', async () => {
      const { default: PaymentsPage } = await import('@/app/admin/payments/page');
      render(<PaymentsPage />);

      // Check for payments content
      expect(screen.getByTestId('admin-nav-payments')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Calendar Management', () => {
    test('displays calendar page', async () => {
      const { default: CalendarPage } = await import('@/app/admin/calendar/page');
      render(<CalendarPage />);

      // Check for calendar content
      expect(screen.getByTestId('admin-nav-calendar')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Costs Management', () => {
    test('displays costs page', async () => {
      const { default: CostsPage } = await import('@/app/admin/costs/page');
      render(<CostsPage />);

      // Check for costs content
      expect(screen.getByTestId('admin-nav-costs')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: CMS Management', () => {
    test('displays CMS page', async () => {
      const { default: CMSPage } = await import('@/app/admin/cms/business/page');
      render(<CMSPage />);

      // Check for CMS content
      expect(screen.getByTestId('admin-nav-cms')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Feedback Management', () => {
    test('displays feedback page', async () => {
      const { default: FeedbackPage } = await import('@/app/admin/feedback/page');
      render(<FeedbackPage />);

      // Check for feedback content
      expect(screen.getByTestId('admin-nav-feedback')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Help Management', () => {
    test('displays help management page', async () => {
      const { default: HelpPage } = await import('@/app/admin/help/page');
      render(<HelpPage />);

      // Check for help content
      expect(screen.getByTestId('admin-nav-help')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Promos Management', () => {
    test('displays promos page', async () => {
      const { default: PromosPage } = await import('@/app/admin/promos/page');
      render(<PromosPage />);

      // Check for promos content
      expect(screen.getByTestId('admin-nav-promos')).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Comments Management', () => {
    test('displays comments page', async () => {
      const { default: CommentsPage } = await import('@/app/admin/comments/page');
      render(<CommentsPage />);

      // Check for comments content
      expect(screen.getByTestId('admin-nav-comments')).toBeInTheDocument();
    });
  });
}); 