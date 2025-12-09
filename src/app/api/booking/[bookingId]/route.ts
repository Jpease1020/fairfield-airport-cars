
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { getBooking } from '@/lib/services/booking-service';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get booking from Firebase
    const adminDb = getAdminDb();
    const bookingDoc = await adminDb.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingDoc.data();
    
    // Convert Firebase timestamps to ISO strings for JSON serialization
    const booking = {
      id: bookingDoc.id,
      ...bookingData,
      pickupDateTime: bookingData?.pickupDateTime?.toDate?.()?.toISOString() || bookingData?.pickupDateTime,
      createdAt: bookingData?.createdAt?.toDate?.()?.toISOString() || bookingData?.createdAt,
      updatedAt: bookingData?.updatedAt?.toDate?.()?.toISOString() || bookingData?.updatedAt,
    };

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updates = body;

    // Get existing booking
    const existingBooking = await getBooking(bookingId);
    
    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (existingBooking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot edit a cancelled booking' }, { status: 400 });
    }

    // Track what changed for SMS notification
    const changedFields: string[] = [];
    const db = getAdminDb();
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    // Get existing nested structures (handle both new nested format and legacy flat format)
    const existingTrip = (existingBooking.trip || {}) as any;
    const existingCustomer = (existingBooking.customer || {}) as any;

    // Handle pickup location update
    if (updates.pickup) {
      const existingPickupAddress = existingTrip.pickup?.address || existingBooking.pickupLocation;
      if (updates.pickup.address && updates.pickup.address !== existingPickupAddress) {
        // Update nested trip.pickup object
        updateData.trip = {
          ...existingTrip,
          pickup: {
            address: updates.pickup.address,
            coordinates: updates.pickup.coordinates || existingTrip.pickup?.coordinates || null
          }
        };
        // Also update legacy flat field for backward compatibility
        updateData.pickupLocation = updates.pickup.address;
        if (updates.pickup.coordinates) {
          updateData.pickupCoords = updates.pickup.coordinates;
        }
        changedFields.push('pickup location');
      }
    }

    // Handle dropoff location update
    if (updates.dropoff) {
      const existingDropoffAddress = existingTrip.dropoff?.address || existingBooking.dropoffLocation;
      if (updates.dropoff.address && updates.dropoff.address !== existingDropoffAddress) {
        // Update nested trip.dropoff object
        updateData.trip = {
          ...existingTrip,
          ...updateData.trip, // Preserve pickup if it was updated
          dropoff: {
            address: updates.dropoff.address,
            coordinates: updates.dropoff.coordinates || existingTrip.dropoff?.coordinates || null
          }
        };
        // Also update legacy flat field
        updateData.dropoffLocation = updates.dropoff.address;
        if (updates.dropoff.coordinates) {
          updateData.dropoffCoords = updates.dropoff.coordinates;
        }
        changedFields.push('dropoff location');
      }
    }

    // Handle pickup date/time update (requires conflict check)
    let dateTimeChanged = false;
    let newPickupDateTime: Date | null = null;
    if (updates.pickupDateTime) {
      newPickupDateTime = new Date(updates.pickupDateTime);
      const oldPickupDateTime = existingBooking.trip?.pickupDateTime 
        ? new Date(existingBooking.trip.pickupDateTime) 
        : (existingBooking.pickupDateTime ? new Date(existingBooking.pickupDateTime) : null);
      
      if (oldPickupDateTime && newPickupDateTime.getTime() !== oldPickupDateTime.getTime()) {
        // Check 24-hour advance notice
        const now = new Date();
        const hoursUntilPickup = (newPickupDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilPickup < 24) {
          return NextResponse.json(
            { error: 'Booking changes must be made at least 24 hours in advance' },
            { status: 400 }
          );
        }

        // Check for scheduling conflicts (exclude current booking)
        const dateStr = newPickupDateTime.toISOString().split('T')[0];
        const startTime = newPickupDateTime.toTimeString().slice(0, 5);
        const endTime = new Date(newPickupDateTime.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5);
        
        const conflictCheck = await driverSchedulingService.checkBookingConflicts(
          dateStr,
          startTime,
          endTime,
          bookingId // Exclude current booking from conflict check
        );

        if (conflictCheck.hasConflict) {
          return NextResponse.json(
            { 
              error: 'Time slot conflicts with existing bookings',
              suggestedTimes: conflictCheck.suggestedTimeSlots
            },
            { status: 409 }
          );
        }

        // Update nested trip.pickupDateTime
        updateData.trip = {
          ...existingTrip,
          ...updateData.trip, // Preserve other trip updates
          pickupDateTime: newPickupDateTime
        };
        // Also update legacy flat field
        updateData.pickupDateTime = newPickupDateTime;
        dateTimeChanged = true;
        changedFields.push('pickup date/time');
      }
    }

    // Handle customer info updates
    if (updates.customer) {
      const customerUpdates: any = {};
      let customerChanged = false;

      if (updates.customer.name && updates.customer.name !== (existingCustomer.name || existingBooking.name)) {
        customerUpdates.name = updates.customer.name;
        updateData.name = updates.customer.name; // Legacy field
        changedFields.push('customer name');
        customerChanged = true;
      }
      if (updates.customer.email && updates.customer.email !== (existingCustomer.email || existingBooking.email)) {
        customerUpdates.email = updates.customer.email;
        updateData.email = updates.customer.email; // Legacy field
        changedFields.push('customer email');
        customerChanged = true;
      }
      if (updates.customer.phone && updates.customer.phone !== (existingCustomer.phone || existingBooking.phone)) {
        customerUpdates.phone = updates.customer.phone;
        updateData.phone = updates.customer.phone; // Legacy field
        changedFields.push('customer phone');
        customerChanged = true;
      }
      if (updates.customer.notes !== undefined && updates.customer.notes !== existingCustomer.notes) {
        customerUpdates.notes = updates.customer.notes;
        updateData.notes = updates.customer.notes; // Legacy field
        changedFields.push('notes');
        customerChanged = true;
      }

      if (customerChanged) {
        updateData.customer = {
          ...existingCustomer,
          ...customerUpdates
        };
      }
    }

    // Update booking in Firestore
    await db.collection('bookings').doc(bookingId).update(updateData);

    // If date/time changed, update driver schedule
    if (dateTimeChanged && newPickupDateTime) {
      const oldPickupDateTime = existingBooking.trip?.pickupDateTime 
        ? new Date(existingBooking.trip.pickupDateTime) 
        : (existingBooking.pickupDateTime ? new Date(existingBooking.pickupDateTime) : null);
      
      if (oldPickupDateTime) {
        // Remove old time slot
        await driverSchedulingService.cancelBooking(bookingId);
        
        // Book new time slot
        const dateStr = newPickupDateTime.toISOString().split('T')[0];
        const startTime = newPickupDateTime.toTimeString().slice(0, 5);
        const endTime = new Date(newPickupDateTime.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5);
        
        const driverId = existingBooking.driverId || 'gregg-driver-001';
        const driverName = existingBooking.driverName || 'Driver';
        const customerName = existingBooking.customer?.name || existingBooking.name || 'Customer';
        const pickupAddress = updates.pickup?.address || existingBooking.trip?.pickup?.address || existingBooking.pickupLocation || '';
        const dropoffAddress = updates.dropoff?.address || existingBooking.trip?.dropoff?.address || existingBooking.dropoffLocation || '';
        
        await driverSchedulingService.bookTimeSlot(
          driverId,
          driverName,
          dateStr,
          startTime,
          endTime,
          bookingId,
          customerName,
          pickupAddress,
          dropoffAddress
        );
      }
    }

    // Get updated booking
    const updatedBooking = await getBooking(bookingId);
    
    // Send SMS notification to admin (Gregg) if any fields changed
    if (changedFields.length > 0) {
      try {
        const { sendAdminSms } = await import('@/lib/services/admin-notification-service');
        const customerName = existingBooking.customer?.name || existingBooking.name || 'Customer';
        const changesList = changedFields.join(', ');
        const message = `Booking updated: ${bookingId} - ${customerName} - Changes: ${changesList}`;
        await sendAdminSms(message);
        console.log('✅ [UPDATE BOOKING] Admin SMS sent successfully');
      } catch (smsError) {
        // Don't fail update if SMS fails
        console.error('❌ [UPDATE BOOKING] Failed to send admin SMS:', smsError);
        console.warn('⚠️ [UPDATE BOOKING] Booking updated but admin SMS not sent');
      }
    }
    
    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      changedFields
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
