import React, { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/services/auth-service';
import { User } from 'firebase/auth';
import { Container, Text } from '@/components/ui';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthChange((firebaseUser: User | null) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else {
          router.push('/admin/login');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return (
        <Container>
          <Text>Loading...</Text>
        </Container>
      );
    }

    if (!user) {
      return null; // or a redirect component
    }

    return <WrappedComponent {...props} />;
  };
  WithAuthComponent.displayName = `WithAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;
  return WithAuthComponent;
};

export default withAuth;
