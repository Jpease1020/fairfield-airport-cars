'use client';

import withAuth from '../withAuth';
import { Container, Stack, Heading, Text, Link, Box } from '@/ui';

type NavItem = { label: string; href?: string; note?: string };

const customerItems: NavItem[] = [
  { label: 'Book a Ride', href: '/book' },
  { label: 'My Bookings', href: '/bookings' },
  { label: 'Payment Methods', href: '/payments/add-method' },
  { label: 'Payments', href: '/payments' },
  { label: 'Customer Portal', href: '/portal' },
  { label: 'Profile', href: '/profile' },
  { label: 'Manage Booking (by ID)', note: '/manage/:id' },
  { label: 'Track Status (by ID)', note: '/status/:id' },
  { label: 'Help', href: '/help' },
  { label: 'About', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const adminItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Bookings', href: '/admin/bookings' },
  { label: 'Drivers', href: '/admin/drivers' },
  { label: 'Payments', href: '/admin/payments' },
  { label: 'Promos', href: '/admin/promos' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Error Monitoring', href: '/admin/error-monitoring' },
  { label: 'Comments', href: '/admin/comments' },
  { label: 'CMS', href: '/admin/cms' },
  { label: 'Calendar', href: '/admin/calendar' },
  { label: 'Costs', href: '/admin/costs' },
  { label: 'Backup Management', href: '/admin/backup-management' },
  { label: 'AI Assistant', href: '/admin/ai-assistant' },
  { label: 'Security Monitoring', href: '/admin/security-monitoring' },
  { label: 'Version Control', href: '/admin/version-control' },
  { label: 'Setup', href: '/admin/setup' },
  { label: 'Help', href: '/admin/help' },
];

function List({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <Stack spacing="md">
      <Heading level={2}>{title}</Heading>
      <Stack spacing="sm">
        {items.map((item) => (
          <Stack key={item.label} direction="horizontal" spacing="xs">
            <Text>•</Text>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <Text>{item.label}</Text>
            )}
            {item.note ? <Text variant="muted"> — {item.note}</Text> : null}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

function OverviewContent() {
  return (
    <Container>
      <Stack spacing="xl">
        <Stack spacing="xs">
          <Heading level={1}>Admin Overview</Heading>
          <Text variant="muted">Quick access for Gregg: customer vs admin pages.</Text>
        </Stack>

        <Stack direction="horizontal" spacing="xl" wrap="wrap">
          <Box>
            <List title="Customer Pages & Features" items={customerItems} />
          </Box>
          <Box>
            <List title="Admin Pages & Features" items={adminItems} />
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}

export default withAuth(OverviewContent);


