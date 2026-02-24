import { NextRequest, NextResponse } from 'next/server';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const pricingData = await request.json();
    
    // Validate required fields
    const requiredNumericFields = ['baseFare', 'perMile', 'perMinute', 'airportReturnMultiplier'] as const;
    const missingFields = requiredNumericFields.filter((field) => {
      const value = pricingData[field];
      return typeof value !== 'number' || Number.isNaN(value);
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required pricing fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    if (pricingData.airportReturnMultiplier < 1) {
      return NextResponse.json(
        { error: 'Airport return multiplier must be at least 1.0' },
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

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

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
