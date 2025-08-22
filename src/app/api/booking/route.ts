import { NextResponse } from 'next/server';
import { createBooking, getBooking } from '@/lib/services/booking-service';
import { updateCustomerProfile } from '@/lib/services/auth-service';
import { getAdminAuth } from '@/lib/utils/firebase-admin';

export async function POST(request: Request) {
  try {
    console.log('🔍 Booking API called - starting request processing');
    
    const bookingData = await request.json();
    console.log('📥 Received booking data:', JSON.stringify(bookingData, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'pickupLocation', 'dropoffLocation', 'pickupDateTime', 'fare'];
    console.log('🔍 Validating required fields:', requiredFields);
    
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        console.error(`❌ Missing required field: ${field}`);
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }
    
    console.log('✅ All required fields present');

    // Create the booking with driver assignment
    console.log('🚀 Calling createBooking service...');
    const bookingId = await createBooking({
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      pickupLocation: bookingData.pickupLocation,
      dropoffLocation: bookingData.dropoffLocation,
      pickupDateTime: new Date(bookingData.pickupDateTime),
      flightNumber: bookingData.flightNumber || '',
      notes: bookingData.notes || '',
      fare: bookingData.fare,
      status: 'pending',
      depositPaid: false,
      balanceDue: bookingData.fare
    });
    
    console.log('✅ Booking created successfully with ID:', bookingId);

    // If user wants to save info for future rides, update their profile
    if (bookingData.saveInfoForFuture && bookingData.email) {
      console.log('💾 Updating user profile...');
      try {
        const adminAuth = getAdminAuth();
        // Get user by email to find their UID
        const userQuery = await adminAuth.getUserByEmail(bookingData.email);
        if (userQuery) {
          await updateCustomerProfile(userQuery.uid, {
            name: bookingData.name,
            phone: bookingData.phone,
            preferences: {
              defaultPickupLocation: bookingData.pickupLocation,
              defaultDropoffLocation: bookingData.dropoffLocation,
              notifications: {
                email: true,
                sms: true
              }
            }
          });
          console.log('✅ User profile updated successfully');
        }
      } catch (profileError) {
        console.error('⚠️ Failed to update user profile:', profileError);
        // Don't fail the booking if profile update fails
      }
    }

    // Get the created booking to return details
    console.log('📋 Fetching created booking details...');
    const booking = await getBooking(bookingId);
    
    console.log('🎉 Booking API completed successfully');
    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Booking created successfully. Please complete payment to confirm your booking.',
      booking: {
        id: bookingId,
        status: booking?.status,
        depositAmount: booking?.depositAmount,
        balanceDue: booking?.balanceDue,
        pickupDateTime: booking?.pickupDateTime,
        pickupLocation: booking?.pickupLocation,
        dropoffLocation: booking?.dropoffLocation,
      }
    });

  } catch (error) {
    console.error('💥 Booking API error:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 