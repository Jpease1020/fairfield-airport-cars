import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('Admin Pages - Gregg\'s Business Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('🔴 CRITICAL: Admin Login Page', () => {
    test('displays login form', async () => {
      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Check for login form elements
      expect(screen.getByText(/admin login/i)).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    test('has Google sign-in option', async () => {
      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Check for Google sign-in
      expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
      expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Admin Dashboard', () => {
    test('displays admin dashboard', async () => {
      const { default: AdminDashboard } = await import('@/app/admin/page');
      render(<AdminDashboard />);

      // Check for dashboard elements
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/drivers/i)).toBeInTheDocument();
    });

    test('has navigation menu', async () => {
      const { default: AdminDashboard } = await import('@/app/admin/page');
      render(<AdminDashboard />);

      // Check for navigation
      expect(screen.getByText(/bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/drivers/i)).toBeInTheDocument();
      expect(screen.getByText(/payments/i)).toBeInTheDocument();
      expect(screen.getByText(/calendar/i)).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Bookings Management', () => {
    test('displays bookings page', async () => {
      const { default: BookingsPage } = await import('@/app/admin/bookings/page');
      render(<BookingsPage />);

      // Check for bookings content
      expect(screen.getByText(/bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/manage/i)).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Drivers Management', () => {
    test('displays drivers page', async () => {
      const { default: DriversPage } = await import('@/app/admin/drivers/page');
      render(<DriversPage />);

      // Check for drivers content
      expect(screen.getByText(/drivers/i)).toBeInTheDocument();
      expect(screen.getByText(/manage/i)).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Payments Management', () => {
    test('displays payments page', async () => {
      const { default: PaymentsPage } = await import('@/app/admin/payments/page');
      render(<PaymentsPage />);

      // Check for payments content
      expect(screen.getByText(/payments/i)).toBeInTheDocument();
      expect(screen.getByText(/transactions/i)).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Calendar Management', () => {
    test('displays calendar page', async () => {
      const { default: CalendarPage } = await import('@/app/admin/calendar/page');
      render(<CalendarPage />);

      // Check for calendar content
      expect(screen.getByText(/calendar/i)).toBeInTheDocument();
      expect(screen.getByText(/schedule/i)).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Costs Management', () => {
    test('displays costs page', async () => {
      const { default: CostsPage } = await import('@/app/admin/costs/page');
      render(<CostsPage />);

      // Check for costs content
      expect(screen.getByText(/costs/i)).toBeInTheDocument();
      expect(screen.getByText(/expenses/i)).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: CMS Management', () => {
    test('displays CMS page', async () => {
      const { default: CMSPage } = await import('@/app/admin/cms/business/page');
      render(<CMSPage />);

      // Check for CMS content
      expect(screen.getByText(/content management/i)).toBeInTheDocument();
      expect(screen.getByText(/edit/i)).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Feedback Management', () => {
    test('displays feedback page', async () => {
      const { default: FeedbackPage } = await import('@/app/admin/feedback/page');
      render(<FeedbackPage />);

      // Check for feedback content
      expect(screen.getByText(/feedback/i)).toBeInTheDocument();
      expect(screen.getByText(/reviews/i)).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Help Management', () => {
    test('displays help management page', async () => {
      const { default: HelpPage } = await import('@/app/admin/help/page');
      render(<HelpPage />);

      // Check for help content
      expect(screen.getByText(/help/i)).toBeInTheDocument();
      expect(screen.getByText(/support/i)).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Promos Management', () => {
    test('displays promos page', async () => {
      const { default: PromosPage } = await import('@/app/admin/promos/page');
      render(<PromosPage />);

      // Check for promos content
      expect(screen.getByText(/promos/i)).toBeInTheDocument();
      expect(screen.getByText(/discounts/i)).toBeInTheDocument();
    });
  });

  describe('🟡 IMPORTANT: Comments Management', () => {
    test('displays comments page', async () => {
      const { default: CommentsPage } = await import('@/app/admin/comments/page');
      render(<CommentsPage />);

      // Check for comments content
      expect(screen.getByText(/comments/i)).toBeInTheDocument();
      expect(screen.getByText(/reviews/i)).toBeInTheDocument();
    });
  });
}); 