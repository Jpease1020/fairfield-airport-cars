import { AdminNavigation } from '@/components/admin/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
} 