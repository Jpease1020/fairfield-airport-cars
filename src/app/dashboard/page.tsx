'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, logout, getCustomerProfile } from '@/lib/services/auth-service';
import { User } from 'firebase/auth';
import { CustomerProfile } from '@/lib/services/auth-service';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  Card,
  Button,
  ToastProvider,
  LoadingSpinner
} from '@/components/ui';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
import { Grid } from '@/components/ui/layout/grid';

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
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

  if (loading) {
    return (
      <Section variant="brand" padding="xl">
        <Container>
          <Stack gap="xl" align="center">
            <LoadingSpinner size="lg" />
            <Text>Loading your dashboard...</Text>
          </Stack>
        </Container>
      </Section>
    );
  }

  if (!user || !profile) {
    return (
      <Section variant="brand" padding="xl">
        <Container>
          <Stack gap="xl" align="center">
            <Text variant="muted">Please log in to access your dashboard.</Text>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <ToastProvider>
      <Section variant="brand" padding="xl">
        <Container>
          <Stack direction="horizontal" justify="between" align="center" marginBottom="xl">
            <Stack gap="sm">
              <H1>
                <EditableText field="customer.dashboard.welcome" defaultValue={`Welcome back, ${profile.name}!`}>
                  Welcome back, {profile.name}!
                </EditableText>
              </H1>
              <Text variant="muted">
                <EditableText field="customer.dashboard.subtitle" defaultValue="Manage your bookings and account">
                  Manage your bookings and account
                </EditableText>
              </Text>
            </Stack>
            <Button variant="outline" onClick={handleLogout} data-testid="logout-button">
              <EditableText field="customer.dashboard.logout" defaultValue="Logout">
                Logout
              </EditableText>
            </Button>
          </Stack>

          {error && (
            <Card variant="elevated" padding="md" margin="md">
              <Text color="error">
                {error}
              </Text>
            </Card>
          )}

          <Stack gap="xl">
            {/* Quick Stats */}
            <Stack gap="md">
              <H2>
                <EditableText field="customer.dashboard.stats_title" defaultValue="Your Stats">
                  Your Stats
                </EditableText>
              </H2>
              <Grid cols={3} gap="md">
                <Card
                  title="Total Bookings"
                  statNumber={profile.totalBookings}
                  icon="📊"
                  data-testid="total-bookings"
                >
                  <EditableText field="customer.dashboard.totalBookings" defaultValue={`${profile.totalBookings} total bookings`}>
                    {profile.totalBookings} total bookings
                  </EditableText>
                </Card>
                <Card
                  title="Total Spent"
                  statNumber={`$${profile.totalSpent.toFixed(2)}`}
                  icon="💰"
                  data-testid="total-spent"
                >
                  <EditableText field="customer.dashboard.totalSpent" defaultValue={`$${profile.totalSpent.toFixed(2)} total spent`}>
                    ${profile.totalSpent.toFixed(2)} total spent
                  </EditableText>
                </Card>
                <Card
                  title="Member Since"
                  statNumber={new Date(profile.createdAt).toLocaleDateString()}
                  icon="🎉"
                  data-testid="member-since"
                >
                  <EditableText field="customer.dashboard.memberSince" defaultValue={`Member since ${new Date(profile.createdAt).toLocaleDateString()}`}>
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </EditableText>
                </Card>
              </Grid>
            </Stack>

            {/* Quick Actions */}
            <Stack gap="md">
              <H2>
                <EditableText field="customer.dashboard.actions_title" defaultValue="Quick Actions">
                  Quick Actions
                </EditableText>
              </H2>
              <Grid cols={3} gap="md">
                <Card
                  title="Book a Ride"
                  description="Schedule your next airport ride"
                  icon="🚗"
                  onClick={handleBookRide}
                  data-testid="book-ride-action"
                >
                  <EditableText field="customer.dashboard.bookRide" defaultValue="Schedule your next airport ride">
                    Schedule your next airport ride
                  </EditableText>
                </Card>
                <Card
                  title="View Bookings"
                  description="Check your booking history"
                  icon="📋"
                  onClick={handleViewBookings}
                  data-testid="view-bookings-action"
                >
                  <EditableText field="customer.dashboard.viewBookings" defaultValue="Check your booking history">
                    Check your booking history
                  </EditableText>
                </Card>
                <Card
                  title="Edit Profile"
                  description="Update your information"
                  icon="👤"
                  onClick={handleEditProfile}
                  data-testid="edit-profile-action"
                >
                  <EditableText field="customer.dashboard.editProfile" defaultValue="Update your information">
                    Update your information
                  </EditableText>
                </Card>
              </Grid>
            </Stack>

            {/* Profile Information */}
            <Card variant="elevated" padding="lg" marginBottom="xl">
              <Stack gap="md">
                <H2>
                  <EditableText field="customer.dashboard.profile_title" defaultValue="Profile Information">
                    Profile Information
                  </EditableText>
                </H2>
                <Stack gap="sm">
                  <Text>
                    <strong>Name:</strong> {profile.name}
                  </Text>
                  <Text>
                    <strong>Email:</strong> {profile.email}
                  </Text>
                  <Text>
                    <strong>Phone:</strong> {profile.phone}
                  </Text>
                  <Text>
                    <strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}
                  </Text>
                  <Text>
                    <strong>Last Login:</strong> {new Date(profile.lastLogin).toLocaleDateString()}
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Recent Bookings */}
            <Card variant="elevated" padding="lg">
              <Stack gap="md">
                <H2>
                  <EditableText field="customer.dashboard.bookings_title" defaultValue="Recent Bookings">
                    Recent Bookings
                  </EditableText>
                </H2>
                {profile.totalBookings === 0 ? (
                  <Text variant="muted">
                    <EditableText field="customer.dashboard.no_bookings" defaultValue="No bookings yet. Book your first ride!">
                      No bookings yet. Book your first ride!
                    </EditableText>
                  </Text>
                ) : (
                  <Text variant="muted">
                    <EditableText field="customer.dashboard.bookings_count" defaultValue={`You have ${profile.totalBookings} total bookings.`}>
                      You have {profile.totalBookings} total bookings.
                    </EditableText>
                  </Text>
                )}
                <Button variant="outline" onClick={handleViewBookings}>
                  <EditableText field="customer.dashboard.view_all_bookings" defaultValue="View All Bookings">
                    View All Bookings
                  </EditableText>
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </ToastProvider>
  );
} 