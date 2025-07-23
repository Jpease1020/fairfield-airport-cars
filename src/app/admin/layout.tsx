import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { AdminProvider } from '@/components/admin/AdminProvider';
import AdminHamburgerMenu from '@/components/admin/AdminHamburgerMenu';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <AdminNavigation />
      
      {/* Admin Hamburger Menu */}
      <AdminHamburgerMenu />
      
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AdminProvider>
  );
} 