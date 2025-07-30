const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  deleteUser 
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA0GetV4zn0iBLhm0904GsrvKSb4clhhyI",
  authDomain: "fairfield-airport-car-service.firebaseapp.com",
  projectId: "fairfield-airport-car-service",
  storageBucket: "fairfield-airport-car-service.firebasestorage.app",
  messagingSenderId: "1036497512786",
  appId: "1:1036497512786:web:546be81d9ba09e7118728b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test user credentials
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@fairfieldairportcar.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

async function setupTestUser() {
  try {
    console.log('🔧 Setting up test user...');
    
    // Check if user already exists
    try {
      await signInWithEmailAndPassword(auth, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      console.log('✅ Test user already exists');
      
      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        console.log('✅ Test user document already exists in Firestore');
        console.log('User data:', userDoc.data());
      } else {
        console.log('⚠️ Test user exists but no Firestore document, creating one...');
        await createUserDocument(auth.currentUser);
      }
      
      return auth.currentUser;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('📝 Creating new test user...');
        return await createTestUser();
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error setting up test user:', error);
    throw error;
  }
}

async function createTestUser() {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    console.log('✅ Test user created in Firebase Auth');
    
    // Create user document in Firestore
    await createUserDocument(userCredential.user);
    
    return userCredential.user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

async function createUserDocument(user) {
  try {
    const userRole = {
      uid: user.uid,
      email: user.email,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      createdAt: new Date(),
      lastLogin: new Date(),
      testUser: true
    };

    await setDoc(doc(db, 'users', user.uid), userRole);
    console.log('✅ Test user document created in Firestore');
    console.log('User role data:', userRole);
  } catch (error) {
    console.error('❌ Error creating user document:', error);
    throw error;
  }
}

async function cleanupTestUser() {
  try {
    console.log('🧹 Cleaning up test user...');
    
    // Sign in to get current user
    await signInWithEmailAndPassword(auth, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    
    if (auth.currentUser) {
      // Delete user from Firebase Auth
      await deleteUser(auth.currentUser);
      console.log('✅ Test user deleted from Firebase Auth');
    }
  } catch (error) {
    console.error('❌ Error cleaning up test user:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'setup':
        await setupTestUser();
        console.log('✅ Test user setup complete!');
        break;
      case 'cleanup':
        await cleanupTestUser();
        console.log('✅ Test user cleanup complete!');
        break;
      default:
        console.log('Usage: node setup-test-user.js [setup|cleanup]');
        console.log('  setup   - Create test user in Firebase Auth and Firestore');
        console.log('  cleanup - Delete test user from Firebase Auth');
        break;
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupTestUser, cleanupTestUser }; 