import { NextRequest, NextResponse } from 'next/server';
import { cmsFlattenedService } from '@/lib/services/cms-service';

export async function POST(request: NextRequest) {
  try {
    const pricingData = await request.json();
    
    // Validate required fields
    if (!pricingData.baseFare || !pricingData.perMile || !pricingData.perMinute) {
      return NextResponse.json(
        { error: 'Missing required pricing fields' },
        { status: 400 }
      );
    }

    // Update pricing in CMS
    await cmsFlattenedService.updatePageContent('pricing', pricingData);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Pricing settings updated successfully',
        data: pricingData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating pricing settings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update pricing settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cmsData = await cmsFlattenedService.getAllCMSData();
    const pricingData = cmsData?.pricing || {};

    return NextResponse.json(
      { 
        success: true, 
        data: pricingData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching pricing settings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pricing settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
