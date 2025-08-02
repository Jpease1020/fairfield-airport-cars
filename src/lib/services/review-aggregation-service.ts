import { googleBusinessService } from './google-business-service';
import { yelpService } from './yelp-service';

export interface UnifiedReview {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewTime: string;
  isVerified: boolean;
  source: 'google' | 'yelp' | 'internal' | 'tripadvisor';
  platform: string;
  platformIcon: string;
}

export interface ReviewAggregation {
  averageRating: number;
  totalReviews: number;
  reviewBreakdown: {
    google: { count: number; average: number };
    yelp: { count: number; average: number };
    internal: { count: number; average: number };
  };
  recentReviews: UnifiedReview[];
}

class ReviewAggregationService {
  async getAggregatedReviews(): Promise<ReviewAggregation> {
    try {
      // Fetch reviews from all platforms
      const [googleProfile, yelpProfile, internalReviews] = await Promise.all([
        googleBusinessService.getBusinessProfile(),
        yelpService.getBusinessProfile(),
        this.getInternalReviews()
      ]);

      // Aggregate data
      const allReviews: UnifiedReview[] = [];

      // Add Google reviews
      if (googleProfile) {
        allReviews.push(...googleProfile.reviews.map(review => ({
          ...review,
          platform: 'Google',
          platformIcon: '🔍'
        })));
      }

      // Add Yelp reviews
      if (yelpProfile) {
        allReviews.push(...yelpProfile.reviews.map(review => ({
          ...review,
          platform: 'Yelp',
          platformIcon: '⭐'
        })));
      }

      // Add internal reviews
      allReviews.push(...internalReviews.map(review => ({
        ...review,
        platform: 'Fairfield Airport Cars',
        platformIcon: '🚗'
      })));

      // Calculate aggregated metrics
      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      // Calculate platform breakdown
      const googleReviews = allReviews.filter(r => r.source === 'google');
      const yelpReviews = allReviews.filter(r => r.source === 'yelp');
      const internalReviewsFiltered = allReviews.filter(r => r.source === 'internal');

      const reviewBreakdown = {
        google: {
          count: googleReviews.length,
          average: googleReviews.length > 0 
            ? googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length 
            : 0
        },
        yelp: {
          count: yelpReviews.length,
          average: yelpReviews.length > 0 
            ? yelpReviews.reduce((sum, r) => sum + r.rating, 0) / yelpReviews.length 
            : 0
        },
        internal: {
          count: internalReviewsFiltered.length,
          average: internalReviewsFiltered.length > 0 
            ? internalReviewsFiltered.reduce((sum, r) => sum + r.rating, 0) / internalReviewsFiltered.length 
            : 0
        }
      };

      // Get recent reviews (last 10)
      const recentReviews = allReviews
        .sort((a, b) => new Date(b.reviewTime).getTime() - new Date(a.reviewTime).getTime())
        .slice(0, 10);

      return {
        averageRating,
        totalReviews,
        reviewBreakdown,
        recentReviews
      };
    } catch (error) {
      console.error('Error aggregating reviews:', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        reviewBreakdown: {
          google: { count: 0, average: 0 },
          yelp: { count: 0, average: 0 },
          internal: { count: 0, average: 0 }
        },
        recentReviews: []
      };
    }
  }

  async getRecentReviews(limit: number = 6): Promise<UnifiedReview[]> {
    const aggregation = await this.getAggregatedReviews();
    return aggregation.recentReviews.slice(0, limit);
  }

  async getAverageRating(): Promise<number> {
    const aggregation = await this.getAggregatedReviews();
    return aggregation.averageRating;
  }

  async getTotalReviewCount(): Promise<number> {
    const aggregation = await this.getAggregatedReviews();
    return aggregation.totalReviews;
  }

  async getReviewBreakdown(): Promise<ReviewAggregation['reviewBreakdown']> {
    const aggregation = await this.getAggregatedReviews();
    return aggregation.reviewBreakdown;
  }

  private async getInternalReviews(): Promise<UnifiedReview[]> {
    // This would fetch from your internal review database
    // For now, return empty array
    return [];
  }
}

export const reviewAggregationService = new ReviewAggregationService(); 