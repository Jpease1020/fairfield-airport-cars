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
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function CustomerDashboardContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
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
          <Text data-cms-id="admin.dashboard.sections.loading.message" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.loading.message', 'Loading your dashboard...')}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text data-cms-id="admin.dashboard.sections.loading.message" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.loading.message', 'Loading your dashboard...')}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted" data-cms-id="admin.dashboard.sections.login.message" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.login.message', 'Please log in to access your dashboard.')}
          </Text>
          <Button onClick={() => router.push('/login')} data-cms-id="admin.dashboard.sections.login.button" interactionMode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.login.button', 'Go to Login')}
          </Button>
        </Stack>
      </Container>
    );
  }

  // Stats data for dashboard
  const stats = [
    {
      icon: '📊',
      title: getCMSField(cmsData, 'admin.dashboard.sections.stats.totalBookings.title', 'Total Bookings'),
      amount: (profile.totalBookings || 0).toString(),
      subtitle: getCMSField(cmsData, 'admin.dashboard.sections.stats.totalBookings.subtitle', 'Total bookings')
    },
    {
      icon: '💰',
      title: getCMSField(cmsData, 'admin.dashboard.sections.stats.totalSpent.title', 'Total Spent'),
      amount: `$${(profile.totalSpent || 0).toFixed(2)}`,
      subtitle: getCMSField(cmsData, 'admin.dashboard.sections.stats.totalSpent.subtitle', 'Total spent')
    },
    {
      icon: '🎉',
      title: getCMSField(cmsData, 'admin.dashboard.sections.stats.memberSince.title', 'Member Since'),
      amount: new Date(profile.createdAt).toLocaleDateString(),
      subtitle: getCMSField(cmsData, 'admin.dashboard.sections.stats.memberSince.subtitle', 'Member since')
    }
  ];

  // Quick actions for dashboard
  const quickActions = [
    {
      icon: '🚗',
      title: getCMSField(cmsData, 'admin.dashboard.sections.quickActions.bookRide.title', 'Book a Ride'),
      description: getCMSField(cmsData, 'admin.dashboard.sections.quickActions.bookRide.description', 'Schedule your next airport ride'),
      onClick: handleBookRide
    },
    {
      icon: '📋',
      title: getCMSField(cmsData, 'admin.dashboard.sections.quickActions.viewBookings.title', 'View Bookings'),
      description: getCMSField(cmsData, 'admin.dashboard.sections.quickActions.viewBookings.description', 'Check your booking history'),
      onClick: handleViewBookings
    },
    {
      icon: '👤',
      title: getCMSField(cmsData, 'admin.dashboard.sections.quickActions.editProfile.title', 'Edit Profile'),
      description: getCMSField(cmsData, 'admin.dashboard.sections.quickActions.editProfile.description', 'Update your information'),
      onClick: handleEditProfile
    }
  ];

  // Profile information content
  const profileContent = (
    <Stack spacing="md">
      <Stack spacing="sm">
        <Text data-cms-id="admin.dashboard.sections.profile.name" mode={mode}>
          <strong>{getCMSField(cmsData, 'admin.dashboard.sections.profile.nameLabel', 'Name:')}</strong> {profile.name}
        </Text>
        <Text data-cms-id="admin.dashboard.sections.profile.email" mode={mode}>
          <strong>{getCMSField(cmsData, 'admin.dashboard.sections.profile.emailLabel', 'Email:')}</strong> {profile.email}
        </Text>
        <Text data-cms-id="admin.dashboard.sections.profile.phone" mode={mode}>
          <strong>{getCMSField(cmsData, 'admin.dashboard.sections.profile.phoneLabel', 'Phone:')}</strong> {profile.phone}
        </Text>
      </Stack>
      <Stack spacing="sm">
        <Text data-cms-id="admin.dashboard.sections.profile.memberSince" mode={mode}>
          <strong>{getCMSField(cmsData, 'admin.dashboard.sections.profile.memberSinceLabel', 'Member Since:')}</strong> {new Date(profile.createdAt).toLocaleDateString()}
        </Text>
        <Text data-cms-id="admin.dashboard.sections.profile.lastLogin" mode={mode}>
          <strong>{getCMSField(cmsData, 'admin.dashboard.sections.profile.lastLoginLabel', 'Last Login:')}</strong> {new Date(profile.lastLogin).toLocaleDateString()}
        </Text>
      </Stack>
    </Stack>
  );

  // Recent bookings content
  const recentBookingsContent = profile.totalBookings === 0 ? (
    <Stack spacing="md" align="center">
      <Text variant="muted" data-cms-id="admin.dashboard.sections.recentBookings.noBookings" mode={mode}>
        {getCMSField(cmsData, 'admin.dashboard.sections.recentBookings.noBookings', 'No bookings yet. Book your first ride!')}
      </Text>
      <Button onClick={handleBookRide} variant="primary" data-cms-id="admin.dashboard.sections.recentBookings.bookFirstRide" interactionMode={mode}>
        {getCMSField(cmsData, 'admin.dashboard.sections.recentBookings.bookFirstRide', 'Book Your First Ride')}
      </Button>
    </Stack>
  ) : (
    <Stack spacing="md">
      <Text variant="muted" data-cms-id="admin.dashboard.sections.recentBookings.bookingsCount" mode={mode}>
        {getCMSField(cmsData, 'admin.dashboard.sections.recentBookings.bookingsCount', `You have ${profile.totalBookings} total bookings.`)}
      </Text>
      <Button variant="outline" onClick={handleViewBookings} data-cms-id="admin.dashboard.sections.recentBookings.viewAllBookings" interactionMode={mode}>
        {getCMSField(cmsData, 'admin.dashboard.sections.recentBookings.viewAllBookings', 'View All Bookings')}
      </Button>
    </Stack>
  );

  if (loading) {
    return (
      <Container>
        <Stack direction="horizontal" spacing="md" align="center">
          <LoadingSpinner />
          <Text data-cms-id="admin.dashboard.sections.loading.profile" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.loading.profile', 'Loading your profile...')}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text data-cms-id="admin.dashboard.sections.error.message" mode={mode}>{error}</Text>
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
                  data-cms-id={`admin.dashboard.sections.quickActions.${index}.button`}
                  interactionMode={mode}
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
            title={getCMSField(cmsData, 'admin.dashboard.sections.recentActivity.profileInformation.title', 'Profile Information')}
            content={profileContent}
            variant="elevated"
          />
          <ContentCard
            title={getCMSField(cmsData, 'admin.dashboard.sections.recentActivity.recentBookings.title', 'Recent Bookings')}
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