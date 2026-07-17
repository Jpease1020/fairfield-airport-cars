
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { getBooking } from '@/lib/services/booking-service';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';
import { FieldValue } from 'firebase-admin/firestore';
import { requireOwnerAdminOrTrackingToken } from '@/lib/utils/auth-server';
import { getBusinessDateString, getBusinessTimeString } from '@/lib/utils/booking-date-time';
import { resolveRideDurationMinutes } from '@/lib/utils/ride-duration';

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
    const normalizedTrip = bookingData?.trip
      ? {
          ...bookingData.trip,
          pickupDateTime:
            bookingData.trip?.pickupDateTime?.toDate?.()?.toISOString() ||
            bookingData.trip?.pickupDateTime,
        }
      : undefined;
    const normalizedConfirmation = bookingData?.confirmation
      ? {
          ...bookingData.confirmation,
          sentAt:
            bookingData.confirmation?.sentAt?.toDate?.()?.toISOString() ||
            bookingData.confirmation?.sentAt,
          confirmedAt:
            bookingData.confirmation?.confirmedAt?.toDate?.()?.toISOString() ||
            bookingData.confirmation?.confirmedAt,
        }
      : undefined;
    
    // Convert Firebase timestamps to ISO strings for JSON serialization
    const booking = {
      id: bookingDoc.id,
      ...bookingData,
      ...(normalizedTrip ? { trip: normalizedTrip } : {}),
      ...(normalizedConfirmation ? { confirmation: normalizedConfirmation } : {}),
      pickupDateTime: bookingData?.pickupDateTime?.toDate?.()?.toISOString() || bookingData?.pickupDateTime,
      createdAt: bookingData?.createdAt?.toDate?.()?.toISOString() || bookingData?.createdAt,
      updatedAt: bookingData?.updatedAt?.toDate?.()?.toISOString() || bookingData?.updatedAt,
    };

    const accessResult = await requireOwnerAdminOrTrackingToken(request, booking);
    if (!accessResult.ok) return accessResult.response;
    const accessMode = 'access' in accessResult ? accessResult.access : undefined;
    const auth = accessResult.auth;

    if ((accessMode === 'tracking-token' || (auth && auth.role !== 'admin')) && booking.confirmation?.token) {
      booking.confirmation = {
        status: booking.confirmation.status,
        sentAt: booking.confirmation.sentAt,
        confirmedAt: booking.confirmation.confirmedAt,
      };
    }

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

    // Tracking-token access (no Firebase session — e.g. a guest right after booking) is allowed here,
    // but scoped down below to flight-info updates only.
    const accessResult = await requireOwnerAdminOrTrackingToken(request, existingBooking);
    if (!accessResult.ok) return accessResult.response;

    if (existingBooking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot edit a cancelled booking' }, { status: 400 });
    }

    const accessMode = 'access' in accessResult ? accessResult.access : undefined;
    if (accessMode === 'tracking-token') {
      const requestedKeys = Object.keys(body || {});
      const disallowedKeys = requestedKeys.filter((key) => key !== 'flightInfo');
      if (disallowedKeys.length > 0) {
        return NextResponse.json(
          { error: 'This link can only be used to update flight info. Please log in to edit other booking details.' },
          { status: 403 }
        );
      }
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
    let oldPickupDateTime: Date | null = null;
    if (updates.pickupDateTime) {
      newPickupDateTime = new Date(updates.pickupDateTime);
      oldPickupDateTime = existingBooking.trip?.pickupDateTime
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

    // Handle flight info update (post-submit flight info phase)
    if (updates.flightInfo) {
      const existingFlightInfo = existingTrip.flightInfo || {};
      const mergedFlightInfo = {
        ...existingFlightInfo,
        ...updates.flightInfo,
      };
      // The flight-info phase explicitly frames this as optional, so a blank submission is a
      // legitimate, expected flow — reject nothing here. But hasFlight:true with every detail
      // field blank is a distinct, meaningless state (not "optional info skipped," just noise)
      // that used to reach the driver-notification email as "Airline: N/A / Flight#: N/A /
      // Time: N/A" instead of the plain "no flight info" case. Normalize it back to false rather
      // than storing a misleading "yes, but nothing" record.
      //
      // This route has no schema validation on `updates` at all, so a detail field can arrive as
      // any JSON type (a number, an object, etc.) — treat anything that isn't a non-blank string
      // as blank rather than calling .trim() on it directly, which throws on a non-string value.
      const isBlankFlightDetail = (value: unknown): boolean =>
        typeof value !== 'string' || value.trim().length === 0;

      if (
        mergedFlightInfo.hasFlight &&
        isBlankFlightDetail(mergedFlightInfo.airline) &&
        isBlankFlightDetail(mergedFlightInfo.flightNumber) &&
        isBlankFlightDetail(mergedFlightInfo.arrivalTime)
      ) {
        mergedFlightInfo.hasFlight = false;
      }
      const flightInfoChanged = (['hasFlight', 'airline', 'flightNumber', 'arrivalTime', 'terminal'] as const).some(
        (key) => mergedFlightInfo[key] !== existingFlightInfo[key]
      );

      if (flightInfoChanged) {
        updateData.trip = {
          ...existingTrip,
          ...updateData.trip, // Preserve other trip updates
          flightInfo: mergedFlightInfo,
        };
        // Also update legacy flat field used by admin bookings table
        if (updates.flightInfo.flightNumber !== undefined) {
          updateData.flightNumber = updates.flightInfo.flightNumber;
        }
        changedFields.push('flight info');
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

    // If date/time changed, atomically re-check for conflicts and move the schedule slot BEFORE
    // writing the booking record — otherwise a conflict discovered only at the scheduling step
    // would leave the booking doc already showing the new time while the old slot was never
    // actually freed and the new one never actually reserved (or, with the old non-atomic
    // cancel-then-book sequence, could silently clobber a slot someone else booked in between).
    if (dateTimeChanged && newPickupDateTime && oldPickupDateTime) {
      const oldDateStr = getBusinessDateString(oldPickupDateTime);
      const newDateStr = getBusinessDateString(newPickupDateTime);
      const startTime = getBusinessTimeString(newPickupDateTime);
      const rideDurationMinutes = resolveRideDurationMinutes(existingTrip?.estimatedMinutes);
      const endTime = getBusinessTimeString(new Date(newPickupDateTime.getTime() + rideDurationMinutes * 60 * 1000));

      const driverId = existingBooking.driverId || 'gregg-driver-001';
      const driverName = existingBooking.driverName || 'Driver';
      const customerName = existingBooking.customer?.name || existingBooking.name || 'Customer';
      const pickupAddress = updates.pickup?.address || existingBooking.trip?.pickup?.address || existingBooking.pickupLocation || '';
      const dropoffAddress = updates.dropoff?.address || existingBooking.trip?.dropoff?.address || existingBooking.dropoffLocation || '';

      const rescheduleResult = await driverSchedulingService.rescheduleBookingAtomic({
        driverId,
        driverName,
        oldDate: oldDateStr,
        newDate: newDateStr,
        startTime,
        endTime,
        bookingId,
        customerName,
        pickupLocation: pickupAddress,
        dropoffLocation: dropoffAddress,
      });

      if (!rescheduleResult.success) {
        return NextResponse.json(
          {
            error: 'Time slot conflicts with existing bookings',
            suggestedTimes: rescheduleResult.conflict.suggestedTimeSlots
          },
          { status: 409 }
        );
      }
    }

    // Update booking in Firestore — only reached once the schedule change (if any) is secured.
    await db.collection('bookings').doc(bookingId).update(updateData);

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
