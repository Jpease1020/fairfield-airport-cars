interface YelpReview {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewTime: string;
  isVerified: boolean;
  source: 'yelp';
}

interface YelpBusinessProfile {
  businessId: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  averageRating: number;
  totalReviews: number;
  reviews: YelpReview[];
}

class YelpService {
  private apiKey: string;
  private businessId: string;

  constructor() {
    this.apiKey = process.env.YELP_API_KEY || '';
    this.businessId = process.env.YELP_BUSINESS_ID || '';
  }

  async getBusinessProfile(): Promise<YelpBusinessProfile | null> {
    if (!this.apiKey || !this.businessId) {
      console.warn('Yelp API not configured');
      return null;
    }

    try {
      // Get business details
      const businessResponse = await fetch(
        `https://api.yelp.com/v3/businesses/${this.businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (!businessResponse.ok) {
        throw new Error('Failed to fetch Yelp business data');
      }

      const businessData = await businessResponse.json();

      // Get reviews
      const reviewsResponse = await fetch(
        `https://api.yelp.com/v3/businesses/${this.businessId}/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (!reviewsResponse.ok) {
        throw new Error('Failed to fetch Yelp reviews');
      }

      const reviewsData = await reviewsResponse.json();

      return {
        businessId: this.businessId,
        name: businessData.name,
        address: businessData.location.address1,
        phone: businessData.phone,
        website: businessData.url,
        averageRating: businessData.rating,
        totalReviews: businessData.review_count,
        reviews: this.transformReviews(reviewsData.reviews)
      };
    } catch (error) {
      console.error('Error fetching Yelp business profile:', error);
      return null;
    }
  }

  private transformReviews(reviews: any[]): YelpReview[] {
    return reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.text,
      reviewerName: review.user.name,
      reviewTime: review.time_created,
      isVerified: review.user.image_url ? true : false,
      source: 'yelp' as const
    }));
  }

  async getRecentReviews(limit: number = 5): Promise<YelpReview[]> {
    const profile = await this.getBusinessProfile();
    return profile?.reviews.slice(0, limit) || [];
  }

  async getAverageRating(): Promise<number> {
    const profile = await this.getBusinessProfile();
    return profile?.averageRating || 0;
  }

  async getTotalReviewCount(): Promise<number> {
    const profile = await this.getBusinessProfile();
    return profile?.totalReviews || 0;
  }
}

export const yelpService = new YelpService(); 