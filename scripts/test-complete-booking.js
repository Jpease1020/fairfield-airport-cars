const fetch = require('node-fetch');

async function testCompleteBooking() {
  try {
    console.log('🧪 Testing complete booking flow...');
    
    // Test 1: Create booking via API
    const bookingData = {
      pickupLocation: 'Fairfield, CT',
      dropoffLocation: 'JFK Airport',
      pickupDateTime: '2025-07-24T10:00:00Z',
      passengerName: 'Test User',
      passengerPhone: '555-123-4567',
      passengerEmail: 'test@example.com',
      fare: 150.00,
      passengers: 2,
      flightNumber: 'AA123',
      notes: 'Test booking from API'
    };
    
    console.log('📝 Creating booking via API...');
    const createResponse = await fetch('http://localhost:3000/api/create-booking-server', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    const createResult = await createResponse.json();
    console.log('Create booking response:', createResult);
    
    if (!createResult.success) {
      throw new Error(`Failed to create booking: ${createResult.error}`);
    }
    
    const bookingId = createResult.bookingId;
    console.log('✅ Booking created with ID:', bookingId);
    
    // Test 2: Get booking via API
    console.log('📖 Getting booking via API...');
    const getResponse = await fetch(`http://localhost:3000/api/get-booking/${bookingId}`);
    const getResult = await getResponse.json();
    console.log('Get booking response:', getResult);
    
    if (!getResult.success) {
      throw new Error(`Failed to get booking: ${getResult.error}`);
    }
    
    console.log('✅ Booking retrieved successfully');
    
    // Test 3: Check if booking page loads
    console.log('🌐 Checking booking page...');
    const pageResponse = await fetch(`http://localhost:3000/booking/${bookingId}`);
    console.log('Booking page status:', pageResponse.status);
    
    if (pageResponse.status === 200) {
      console.log('✅ Booking page loads successfully');
    } else {
      console.log('⚠️ Booking page returned status:', pageResponse.status);
    }
    
    console.log('🎉 Complete booking flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCompleteBooking(); 