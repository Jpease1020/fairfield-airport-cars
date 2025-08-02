import { NextResponse } from 'next/server';
import { reviewAggregationService } from '@/lib/services/review-aggregation-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const includeBreakdown = searchParams.get('breakdown') !== 'false';

    const [recentReviews, aggregation] = await Promise.all([
      reviewAggregationService.getRecentReviews(limit),
      includeBreakdown ? reviewAggregationService.getAggregatedReviews() : null
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews: recentReviews,
        aggregation: aggregation ? {
          averageRating: aggregation.averageRating,
          totalReviews: aggregation.totalReviews,
          reviewBreakdown: aggregation.reviewBreakdown
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching aggregated reviews:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch reviews' 
    }, { status: 500 });
  }
} 