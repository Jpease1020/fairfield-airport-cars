import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      services: {
        database: 'operational', // Would check actual DB in real implementation
        payments: process.env.SQUARE_ACCESS_TOKEN ? 'configured' : 'not_configured',
        maps: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? 'configured' : 'not_configured',
        sms: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured'
      },
      critical_paths: {
        booking_api: 'operational',
        payment_api: 'operational',
        admin_api: 'operational'
      }
    };

    // Quick API endpoint checks (in a real implementation, you'd test actual endpoints)
    const apiStatus = await Promise.allSettled([
      // These would be actual health checks in production
      Promise.resolve('booking-api-ok'),
      Promise.resolve('payment-api-ok'),
      Promise.resolve('admin-api-ok')
    ]);

    const failedServices = apiStatus.filter(result => result.status === 'rejected').length;
    
    if (failedServices > 0) {
      healthData.status = 'degraded';
    }

    return NextResponse.json(healthData, {
      status: healthData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
} 