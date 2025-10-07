'use client';

import '@/design/globals.css';
import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/services/auth-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { User } from 'firebase/auth';
import { Container } from '@/design/ui';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  // Check if user has admin role in Firestore
  const checkAdminRole = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === 'admin' || 
               (userData.permissions && userData.permissions.includes('admin'));
      }
      return false;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  useEffect(() => {
    // Skip auth check for auth pages (login, register, forgot-password)
    if (pathname.startsWith('/auth/')) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthChange(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Check if user has admin privileges
        const hasAdminRole = await checkAdminRole(firebaseUser);
        setIsAdmin(hasAdminRole);
        
        if (!hasAdminRole) {
          // Redirect non-admin users to login
          router.push('/login');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        router.push('/login');
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router, pathname]);

  // Show loading state
  if (loading) {
    return (
      <Container>
        Loading...
      </Container>
    );
  }

  // Allow auth pages to render without auth check
  if (pathname.startsWith('/auth/')) {
    return <div>{children}</div>;
  }

  // Block non-admin users from accessing admin pages
  if (!user || !isAdmin) {
    return null; // or a redirect component
  }

  // Render admin pages with admin navigation for authenticated admin users
  return (
    <Suspense fallback={
      <Container>
        Loading admin interface...
      </Container>
    }>
      {/* Admin Page Content */}
      {children}
    </Suspense>
  );
} 