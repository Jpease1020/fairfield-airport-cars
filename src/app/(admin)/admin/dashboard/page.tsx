'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, logout, getCustomerProfile, authService } from '@/lib/services/auth-service';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/lib/services/auth-service';
import { 
  Container,
  Stack,
  Text,
  Button,
  LoadingSpinner,
  Alert,
} from '@/ui';
import { ContentCard, Grid } from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function CustomerDashboardContent() {
  const { cmsData } = useCMSData();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check if user is admin first
        const isAdmin = await authService.isAdmin(firebaseUser.uid);
        if (isAdmin) {
          router.push('/admin');
          return;
        }
        
        // If not admin, load customer profile
        loadCustomerProfile(firebaseUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router]);

  const loadCustomerProfile = async (uid: string) => {
    try {
      const customerProfile = await getCustomerProfile(uid);
      setProfile(customerProfile);
    } catch (error) {
      console.error('Error loading customer profile:', error);
      setError('Failed to load profile');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBookRide = () => {
    router.push('/book');
  };

  const handleViewBookings = () => {
    router.push('/bookings');
  };

  const handleEditProfile = () => {
    router.push('/profile');
  };

  if (!isClient) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Initializing dashboard...</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading your dashboard...</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">Please log in to access your dashboard.</Text>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  // Stats data for dashboard
  const stats = [
    {
      icon: '📊',
      title: 'Total Bookings',
      amount: (profile.totalBookings || 0).toString(),
      subtitle: 'Total bookings'
    },
    {
      icon: '💰',
      title: 'Total Spent',
      amount: `$${(profile.totalSpent || 0).toFixed(2)}`,
      subtitle: 'Total spent'
    },
    {
      icon: '🎉',
      title: 'Member Since',
      amount: new Date(profile.createdAt).toLocaleDateString(),
      subtitle: 'Member since'
    }
  ];

  // Quick actions for dashboard
  const quickActions = [
    {
      icon: '🚗',
      title: 'Book a Ride',
      description: 'Schedule your next airport ride',
      onClick: handleBookRide
    },
    {
      icon: '📋',
      title: 'View Bookings',
      description: 'Check your booking history',
      onClick: handleViewBookings
    },
    {
      icon: '👤',
      title: 'Edit Profile',
      description: 'Update your information',
      onClick: handleEditProfile
    }
  ];

  // Profile information content
  const profileContent = (
    <Stack spacing="md">
      <Stack spacing="sm">
        <Text><strong>Name:</strong> {profile.name}</Text>
        <Text><strong>Email:</strong> {profile.email}</Text>
        <Text><strong>Phone:</strong> {profile.phone}</Text>
      </Stack>
      <Stack spacing="sm">
        <Text><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</Text>
        <Text><strong>Last Login:</strong> {new Date(profile.lastLogin).toLocaleDateString()}</Text>
      </Stack>
    </Stack>
  );

  // Recent bookings content
  const recentBookingsContent = profile.totalBookings === 0 ? (
    <Stack spacing="md" align="center">
      <Text variant="muted">
        {getCMSField(cmsData, 'customer.dashboard.no_bookings', 'No bookings yet. Book your first ride!')}
      </Text>
      <Button onClick={handleBookRide} variant="primary">
        {getCMSField(cmsData, 'customer.dashboard.book_first_ride', 'Book Your First Ride')}
      </Button>
    </Stack>
  ) : (
    <Stack spacing="md">
      <Text variant="muted">
        {getCMSField(cmsData, 'customer.dashboard.bookings_count', `You have ${profile.totalBookings} total bookings.`)}
      </Text>
      <Button variant="outline" onClick={handleViewBookings}>
        {getCMSField(cmsData, 'customer.dashboard.view_all_bookings', 'View All Bookings')}
      </Button>
    </Stack>
  );

  if (loading) {
    return (
      
        <Container>
          <Stack direction="horizontal" spacing="md" align="center">
            <LoadingSpinner />
            <Text>Loading your profile...</Text>
          </Stack>
        </Container>
      
    );
  }

  if (error) {
    return (
      
        <Container>
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        </Container>
    
    );
  }

  return (
    <>
      <Stack spacing="xl">
        {/* Stats */}
        <Grid cols={3} gap="lg">
          {stats.map((stat, index) => (
            <ContentCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              subtitle={stat.subtitle}
              content={
                <Text size="xl" weight="bold">
                  {stat.amount}
                </Text>
              }
              variant="elevated"
              data-testid={`stat-${index}`}
            />
          ))}
        </Grid>

        {/* Quick Actions */}
        <Grid cols={3} gap="lg">
          {quickActions.map((action, index) => (
            <ContentCard
              key={index}
              icon={action.icon}
              title={action.title}
              subtitle={action.description}
              content={
                <Button 
                  variant="ghost" 
                  onClick={action.onClick}
                  fullWidth
                >
                  {action.title}
                </Button>
              }
              variant="elevated"
              data-testid={`${action.title.toLowerCase().replace(' ', '-')}-action`}
            />
          ))}
        </Grid>

        {/* Recent Activity */}
        <Stack spacing="lg">
          <ContentCard
            title="Profile Information"
            content={profileContent}
            variant="elevated"
          />
          <ContentCard
            title="Recent Bookings"
            content={recentBookingsContent}
            variant="elevated"
          />
        </Stack>
      </Stack>
    </>
  );
}

const CustomerDashboard = dynamic(() => Promise.resolve(CustomerDashboardContent), { ssr: false });

export default CustomerDashboard; 