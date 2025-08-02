import { Container, Text, Stack } from '@/ui';

export default function NotFound() {
  return (
    <Container variant="default" padding="lg">
      <Stack direction="vertical" spacing="lg" align="center">
        <Text variant="lead" size="xl" weight="bold">
          404 - Page Not Found
        </Text>
        <Text variant="body" color="muted" align="center">
          The page you are looking for does not exist.
        </Text>
      </Stack>
    </Container>
  );
} 