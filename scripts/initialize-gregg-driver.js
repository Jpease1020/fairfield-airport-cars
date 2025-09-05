const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Firebase config (using emulator)
const firebaseConfig = {
  projectId: 'fairfield-airport-cars',
  // Use emulator
  host: 'localhost:8081',
  ssl: false
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeGreggDriver() {
  try {
    console.log('🚗 Initializing Gregg as the driver...');
    
    // Create Gregg's driver record
    const greggDriver = {
      id: 'gregg-driver-001',
      name: 'Gregg',
      phone: '203-994-5439',
      email: 'gregg@fairfieldairportcar.com',
      status: 'available',
      vehicleInfo: {
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        color: 'White',
        licensePlate: 'FAC-001'
      },
      availability: {
        monday: { start: '06:00', end: '22:00', available: true },
        tuesday: { start: '06:00', end: '22:00', available: true },
        wednesday: { start: '06:00', end: '22:00', available: true },
        thursday: { start: '06:00', end: '22:00', available: true },
        friday: { start: '06:00', end: '22:00', available: true },
        saturday: { start: '06:00', end: '22:00', available: true },
        sunday: { start: '06:00', end: '22:00', available: true }
      },
      rating: 5.0,
      totalRides: 0,
      currentLocation: {
        lat: 41.2619, // Fairfield, CT coordinates
        lng: -73.2897,
        timestamp: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add Gregg to the drivers collection
    await setDoc(doc(db, 'drivers', 'gregg-driver-001'), greggDriver);
    
    console.log('✅ Gregg driver record created successfully!');
    console.log('📋 Driver ID: gregg-driver-001');
    console.log('👤 Name: Gregg');
    console.log('📞 Phone: 203-994-5439');
    console.log('🚗 Vehicle: 2023 Ford Transit (White)');
    console.log('⏰ Available: 6 AM - 10 PM, 7 days a week');
    
  } catch (error) {
    console.error('❌ Error initializing Gregg driver:', error);
  }
}

// Run the initialization
initializeGreggDriver().then(() => {
  console.log('🎉 Driver initialization complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Initialization failed:', error);
  process.exit(1);
});
