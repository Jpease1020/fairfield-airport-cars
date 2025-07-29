// Script to set up admin user in Firestore
// Run this after logging in to create the user role document

import { db } from '../src/lib/utils/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const setupAdminUser = async (uid, email) => {
  try {
    const userRole = {
      uid,
      email,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await setDoc(doc(db, 'users', uid), userRole);
    console.log('✅ Admin user created successfully:', email);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Usage: Call this function with the user's UID and email
// setupAdminUser('user-uid-here', 'admin@example.com');

export { setupAdminUser }; 