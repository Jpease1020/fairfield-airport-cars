'use client';

import { useAdmin } from '@/components/admin/AdminProvider';
import { Button } from '@/components/ui/button';
import { Layout, Container, Stack, Card } from '@/components/ui/containers';

export default function TestPage() {
  const { isAdmin, editMode, commentMode } = useAdmin();

  const toggleAdminMode = () => {
    console.log('🔧 TestPage - Toggle admin mode clicked');
    if (typeof window !== 'undefined') {
      const currentAdminMode = localStorage.getItem('admin-mode');
      console.log('🔧 TestPage - Current admin mode:', currentAdminMode);
      
      if (currentAdminMode === 'true') {
        console.log('🔧 TestPage - Disabling admin mode');
        localStorage.removeItem('admin-mode');
        window.location.reload();
      } else {
        console.log('🔧 TestPage - Enabling admin mode');
        localStorage.setItem('admin-mode', 'true');
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Layout spacing="lg" container maxWidth="xl">
        <Container padding="lg" margin="none">
          <Stack spacing="lg">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-text-primary">Test Page</h1>
            </div>
            
            <Card padding="lg" margin="none">
              <Stack spacing="md">
                <h2 className="text-xl font-semibold text-text-primary">Admin Controls</h2>
                <Stack spacing="md">
                  <Button 
                    onClick={toggleAdminMode}
                    variant={isAdmin ? 'outline' : 'default'}
                    size="lg"
                    className={`text-lg px-8 py-4 ${
                      isAdmin 
                        ? 'bg-error text-text-inverse hover:bg-error-hover' 
                        : 'bg-success text-text-inverse hover:bg-success-hover'
                    }`}
                  >
                    {isAdmin ? 'Disable Admin Mode' : 'Enable Admin Mode'}
                  </Button>
                  <p className="text-sm text-text-secondary">
                    Click the button above to toggle admin mode and see the hamburger menu.
                  </p>
                  <div className="p-4 bg-bg-info rounded-lg">
                    <h3 className="font-semibold mb-2 text-text-primary">Debug Info:</h3>
                    <Stack spacing="xs">
                      <p className="text-text-secondary">NODE_ENV: {process.env.NODE_ENV}</p>
                      <p className="text-text-secondary">localStorage admin-mode: {typeof window !== 'undefined' ? localStorage.getItem('admin-mode') : 'N/A'}</p>
                      <p className="text-text-secondary">URL admin param: {typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('admin') : 'N/A'}</p>
                    </Stack>
                  </div>
                </Stack>
              </Stack>
            </Card>
            
            <Card padding="lg" margin="none">
              <Stack spacing="md">
                <h2 className="text-xl font-semibold text-text-primary">Admin Status</h2>
                <Stack spacing="sm">
                  <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
                  <p><strong>Edit Mode:</strong> {editMode ? 'ON' : 'OFF'}</p>
                  <p><strong>Comment Mode:</strong> {commentMode ? 'ON' : 'OFF'}</p>
                </Stack>
              </Stack>
            </Card>

            <Card padding="lg" margin="none">
              <Stack spacing="md">
                <h2 className="text-xl font-semibold text-text-primary">Test Content</h2>
                <p className="text-text-primary">This is a test page to verify the hamburger menu functionality.</p>
                <p className="text-text-primary">If you&apos;re an admin, you should see a hamburger menu in the top-left corner.</p>
                <div className="p-4 bg-bg-info rounded-lg">
                  <h3 className="font-semibold mb-2 text-text-primary">How to test:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-text-primary">
                    <li>Click &ldquo;Enable Admin Mode&rdquo; above</li>
                    <li>Look for the hamburger menu in the top-left corner</li>
                    <li>Click the hamburger menu to see the three modes</li>
                    <li>Try switching between Site Mode, Edit Mode, and Comment Mode</li>
                  </ol>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Layout>
    </div>
  );
} 