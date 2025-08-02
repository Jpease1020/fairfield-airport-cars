import { NextResponse } from 'next/server';

interface GoogleReview {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewTime: string;
  isVerified: boolean;
  source: 'google';
}

interface GoogleBusinessProfile {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  averageRating: number;
  totalReviews: number;
  reviews: GoogleReview[];
}

class GoogleBusinessService {
  private apiKey: string;
  private placeId: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.placeId = process.env.GOOGLE_PLACE_ID || '';
  }

  async getBusinessProfile(): Promise<GoogleBusinessProfile | null> {
    if (!this.apiKey || !this.placeId) {
      console.warn('Google Business API not configured');
      return null;
    }

    try {
      // Get place details including reviews
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Google Business data');
      }

      const data = await response.json();
      const place = data.result;

      if (!place) {
        throw new Error('Place not found');
      }

      return {
        placeId: this.placeId,
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        averageRating: place.rating || 0,
        totalReviews: place.user_ratings_total || 0,
        reviews: this.transformReviews(place.reviews || [])
      };
    } catch (error) {
      console.error('Error fetching Google Business profile:', error);
      return null;
    }
  }

  private transformReviews(reviews: any[]): GoogleReview[] {
    return reviews.map(review => ({
      id: review.time.toString(),
      rating: review.rating,
      comment: review.text,
      reviewerName: review.author_name,
      reviewTime: new Date(review.time * 1000).toISOString(),
      isVerified: review.author_url ? true : false,
      source: 'google' as const
    }));
  }

  async getRecentReviews(limit: number = 5): Promise<GoogleReview[]> {
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

export const googleBusinessService = new GoogleBusinessService(); 