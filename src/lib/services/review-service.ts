import { db } from '@/lib/utils/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

export interface Review {
  id?: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5 stars
  comment?: string;
  driverId: string;
  driverName: string;
  rideDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Create a new review
export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const reviewDoc = {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), reviewDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw new Error('Failed to create review');
  }
};

// Get reviews for a specific driver
export const getDriverReviews = async (driverId: string, limit = 10): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('driverId', '==', driverId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error getting driver reviews:', error);
    throw new Error('Failed to get reviews');
  }
};

// Get review statistics for a driver
export const getDriverReviewStats = async (driverId: string): Promise<ReviewStats> => {
  try {
    const reviews = await getDriverReviews(driverId, 1000); // Get all reviews for stats
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
      ratingDistribution
    };
  } catch (error) {
    console.error('Error getting review stats:', error);
    throw new Error('Failed to get review statistics');
  }
};

// Check if a booking has already been reviewed
export const hasBookingBeenReviewed = async (bookingId: string): Promise<boolean> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('bookingId', '==', bookingId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if booking reviewed:', error);
    return false;
  }
};

// Send review request email/SMS (placeholder for notification service)
export const sendReviewRequest = async (bookingId: string, customerEmail: string, customerName: string): Promise<void> => {
  // This would integrate with email/SMS service
  console.log(`Sending review request to ${customerEmail} for booking ${bookingId}`);
  
  // Example email template
  const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/feedback/${bookingId}`;
  
  // TODO: Integrate with email service
  console.log(`Review URL: ${reviewUrl}`);
}; 