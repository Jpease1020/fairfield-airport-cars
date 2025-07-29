import { 
  createReview, 
  getDriverReviews, 
  getDriverReviewStats, 
  hasBookingBeenReviewed,
  sendReviewRequest 
} from '@/lib/services/review-service';

// Mock Firebase
jest.mock('@/lib/utils/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: mockAddDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  serverTimestamp: jest.fn(() => new Date())
}));

describe('Review Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Review Creation', () => {
    it('should create a new review successfully', async () => {
      const mockReviewId = 'review-123';
      mockAddDoc.mockResolvedValue({ id: mockReviewId });

      const reviewData = {
        bookingId: 'booking-123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        rating: 5,
        comment: 'Great service!',
        driverId: 'gregg-main-driver',
        driverName: 'Gregg',
        rideDate: new Date('2024-12-25')
      };

      const reviewId = await createReview(reviewData);

      expect(reviewId).toBe(mockReviewId);
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          ...reviewData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      );
    });

    it('should handle review creation errors', async () => {
      mockAddDoc.mockRejectedValue(new Error('Database error'));

      const reviewData = {
        bookingId: 'booking-123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        rating: 5,
        comment: 'Great service!',
        driverId: 'gregg-main-driver',
        driverName: 'Gregg',
        rideDate: new Date('2024-12-25')
      };

      await expect(createReview(reviewData)).rejects.toThrow('Failed to create review');
    });
  });

  describe('Review Retrieval', () => {
    it('should get driver reviews', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          bookingId: 'booking-1',
          customerName: 'John Doe',
          rating: 5,
          comment: 'Great service!',
          createdAt: new Date()
        },
        {
          id: 'review-2',
          bookingId: 'booking-2',
          customerName: 'Jane Smith',
          rating: 4,
          comment: 'Good ride',
          createdAt: new Date()
        }
      ];

      mockGetDocs.mockResolvedValue({
        docs: mockReviews.map(review => ({
          id: review.id,
          data: () => review
        }))
      });

      const reviews = await getDriverReviews('gregg-main-driver');

      expect(reviews).toHaveLength(2);
      expect(reviews[0].id).toBe('review-1');
      expect(reviews[0].rating).toBe(5);
      expect(reviews[1].id).toBe('review-2');
      expect(reviews[1].rating).toBe(4);
    });

    it('should handle empty reviews', async () => {
      mockGetDocs.mockResolvedValue({
        docs: []
      });

      const reviews = await getDriverReviews('gregg-main-driver');

      expect(reviews).toHaveLength(0);
    });
  });

  describe('Review Statistics', () => {
    it('should calculate review statistics correctly', async () => {
      const mockReviews = [
        { rating: 5 },
        { rating: 5 },
        { rating: 4 },
        { rating: 4 },
        { rating: 3 },
        { rating: 2 },
        { rating: 1 }
      ];

      mockGetDocs.mockResolvedValue({
        docs: mockReviews.map(review => ({
          id: 'review-id',
          data: () => review
        }))
      });

      const stats = await getDriverReviewStats('gregg-main-driver');

      expect(stats.averageRating).toBe(3.4);
      expect(stats.totalReviews).toBe(7);
      expect(stats.ratingDistribution).toEqual({
        1: 1,
        2: 1,
        3: 1,
        4: 2,
        5: 2
      });
    });

    it('should handle no reviews', async () => {
      mockGetDocs.mockResolvedValue({
        docs: []
      });

      const stats = await getDriverReviewStats('gregg-main-driver');

      expect(stats.averageRating).toBe(0);
      expect(stats.totalReviews).toBe(0);
      expect(stats.ratingDistribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      });
    });
  });

  describe('Review Checking', () => {
    it('should check if booking has been reviewed', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false
      });

      const hasReviewed = await hasBookingBeenReviewed('booking-123');

      expect(hasReviewed).toBe(true);
    });

    it('should return false for unreviewed booking', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true
      });

      const hasReviewed = await hasBookingBeenReviewed('booking-123');

      expect(hasReviewed).toBe(false);
    });
  });

  describe('Review Request', () => {
    it('should send review request', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await sendReviewRequest('booking-123', 'john@example.com', 'John Doe');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sending review request to john@example.com for booking booking-123'
      );

      consoleSpy.mockRestore();
    });
  });
}); 