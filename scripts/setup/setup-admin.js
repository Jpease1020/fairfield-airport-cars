const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function setupAdminUser(email, password, role = 'admin') {
  try {
    console.log(`Setting up admin user: ${email}`);
    
    // First, try to sign in to get the user UID
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`User authenticated: ${user.uid}`);
    
    // Create or update the user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      uid: user.uid,
      email: email,
      role: role,
      permissions: ['read', 'write', 'admin'],
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    await setDoc(userRef, userData);
    
    console.log(`✅ Admin user setup complete for: ${email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Role: ${role}`);
    console.log(`   Permissions: ${userData.permissions.join(', ')}`);
    
    return user.uid;
  } catch (error) {
    console.error(`❌ Failed to setup admin user ${email}:`, error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 User does not exist. Please create the user account first in Firebase Console.');
      console.log('   Go to: https://console.firebase.google.com/project/YOUR_PROJECT/authentication/users');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Wrong password. Please check the password.');
    }
    
    return null;
  }
}

async function checkAdminUser(email) {
  try {
    console.log(`Checking admin status for: ${email}`);
    
    // Get all users from the users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log(`✅ Found user: ${email}`);
      console.log(`   UID: ${userData.uid}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Permissions: ${userData.permissions.join(', ')}`);
      
      return userData;
    } else {
      console.log(`❌ No user found with email: ${email}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error checking admin user:`, error.message);
    return null;
  }
}

async function listAllAdmins() {
  try {
    console.log('Listing all admin users...');
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No admin users found in database.');
      return;
    }
    
    console.log(`✅ Found ${querySnapshot.size} admin user(s):`);
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`   - ${userData.email} (UID: ${userData.uid})`);
    });
  } catch (error) {
    console.error('❌ Error listing admin users:', error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'setup':
      const email = args[1];
      const password = args[2];
      const role = args[3] || 'admin';
      
      if (!email || !password) {
        console.log('Usage: node setup-admin.js setup <email> <password> [role]');
        console.log('Example: node setup-admin.js setup justin@example.com mypassword admin');
        process.exit(1);
      }
      
      await setupAdminUser(email, password, role);
      break;
      
    case 'check':
      const checkEmail = args[1];
      if (!checkEmail) {
        console.log('Usage: node setup-admin.js check <email>');
        process.exit(1);
      }
      
      await checkAdminUser(checkEmail);
      break;
      
    case 'list':
      await listAllAdmins();
      break;
      
    default:
      console.log('Admin User Setup Script');
      console.log('');
      console.log('Usage:');
      console.log('  node setup-admin.js setup <email> <password> [role]  - Setup admin user');
      console.log('  node setup-admin.js check <email>                     - Check admin status');
      console.log('  node setup-admin.js list                              - List all admin users');
      console.log('');
      console.log('Examples:');
      console.log('  node setup-admin.js setup justin@example.com mypassword');
      console.log('  node setup-admin.js check justin@example.com');
      console.log('  node setup-admin.js list');
      break;
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupAdminUser, checkAdminUser, listAllAdmins }; 