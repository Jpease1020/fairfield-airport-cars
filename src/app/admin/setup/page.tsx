'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function SetupPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const setupAdminUser = async () => {
    if (!user) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const userRole = {
        uid: user.uid,
        email: user.email,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        createdAt: new Date(),
        lastLogin: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userRole);
      setMessage('✅ Admin user created successfully! You can now access admin features.');
    } catch (error) {
      console.error('Error creating admin user:', error);
      setMessage('❌ Error creating admin user. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Setup</h1>
        
        {user ? (
          <div>
            <p className="text-gray-600 mb-4">
              Logged in as: <strong>{user.email}</strong>
            </p>
            <p className="text-gray-600 mb-6">
              Click the button below to create your admin user role in the database.
            </p>
            
            <button
              onClick={setupAdminUser}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Setup Admin User'}
            </button>
            
            {message && (
              <div className="mt-4 p-3 rounded bg-gray-100">
                {message}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Please log in first to set up your admin account.
            </p>
            <a
              href="/admin/login"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            >
              Go to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 