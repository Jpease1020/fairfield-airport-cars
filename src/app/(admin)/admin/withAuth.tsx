import React, { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/services/auth-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { User } from 'firebase/auth';
import { Container } from '@/ui';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
    }, [router]);

    if (loading) {
      return (
        <Container>
          Loading...
        </Container>
      );
    }

    if (!user || !isAdmin) {
      return null; // or a redirect component
    }

    return <WrappedComponent {...props} />;
  };
  WithAuthComponent.displayName = `WithAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;
  return WithAuthComponent;
};

export default withAuth;
