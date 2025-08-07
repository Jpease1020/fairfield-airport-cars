'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/services/auth-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { User } from 'firebase/auth';
import { Container } from '@/ui';
import { EditableText } from '@/ui';
import { AdminNavigation } from '@/components/app/AdminNavigation';

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
    // Skip auth check for login page
    if (pathname === '/admin/login') {
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
          router.push('/admin/login');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        router.push('/admin/login');
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
        <EditableText field="admin.loading" defaultValue="Loading...">
          Loading...
        </EditableText>
      </Container>
    );
  }

  // Allow login page to render without auth check
  if (pathname === '/admin/login') {
    return <div>{children}</div>;
  }

  // Block non-admin users from accessing admin pages
  if (!user || !isAdmin) {
    return null; // or a redirect component
  }

  // Render admin pages with admin navigation for authenticated admin users
  return (
    <div>
      {/* Admin Navigation Header */}
      <AdminNavigation />
      
      {/* Admin Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
} 