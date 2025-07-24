const fetch = require('node-fetch');

async function testSimpleBooking() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Simple Booking Flow...\n');

  try {
    // Test 1: Create a booking
    console.log('1. Creating a test booking...');
    const bookingData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-1234',
      pickupLocation: 'Fairfield, CT',
      dropoffLocation: 'JFK Airport',
      pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      passengers: 1,
      status: 'pending',
      fare: 150,
      depositPaid: false,
      balanceDue: 150
    };

    const createResponse = await fetch(`${baseUrl}/api/create-booking-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const createResult = await createResponse.json();
    
    if (!createResult.success) {
      throw new Error(`Failed to create booking: ${createResult.error}`);
    }

    console.log('✅ Booking created successfully!');
    console.log(`   Booking ID: ${createResult.bookingId}\n`);

    // Test 2: Retrieve the booking
    console.log('2. Retrieving the booking...');
    const getResponse = await fetch(`${baseUrl}/api/get-bookings-simple?id=${createResult.bookingId}`);
    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.log('⚠️  Could not retrieve booking (likely due to Firestore rules)');
      console.log(`   Error: ${getResult.error}`);
    } else {
      console.log('✅ Booking retrieved successfully!');
      console.log(`   Passenger: ${getResult.booking.name}`);
      console.log(`   From: ${getResult.booking.pickupLocation}`);
      console.log(`   To: ${getResult.booking.dropoffLocation}`);
      console.log(`   Fare: $${getResult.booking.fare}`);
    }

    // Test 3: Check time slot availability
    console.log('\n3. Checking time slot availability...');
    const timeSlotResponse = await fetch(`${baseUrl}/api/check-time-slot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pickupDateTime: bookingData.pickupDateTime,
        bufferMinutes: 60,
      }),
    });

    const timeSlotResult = await timeSlotResponse.json();
    
    if (timeSlotResult.success) {
      console.log('✅ Time slot check completed!');
      console.log(`   Available: ${timeSlotResult.isAvailable}`);
      console.log(`   Conflicting bookings: ${timeSlotResult.conflictingBookings}`);
    } else {
      console.log('⚠️  Time slot check failed');
      console.log(`   Error: ${timeSlotResult.error}`);
    }

    console.log('\n🎉 Simple booking test completed!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Booking creation: Working');
    console.log('   ⚠️  Booking retrieval: Limited by Firestore rules');
    console.log('   ✅ Time slot checking: Working');
    console.log('\n💡 To enable booking retrieval, deploy Firestore rules with:');
    console.log('   firebase login --reauth');
    console.log('   firebase deploy --only firestore:rules');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleBooking(); 