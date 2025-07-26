'use client';

import { useState, useEffect } from 'react';
import { 
  AdminPageWrapper,
  GridSection, 
  StatCard, 
  InfoCard, 
  ActionGrid,
  DataTable,
  DataTableColumn,
  DataTableAction,
  ToastProvider,
  useToast
} from '@/components/ui';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'on-trip' | 'offline';
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  rating: number;
  totalRides: number;
  location?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  createdAt: Date;
}

function DriversPageContent() {
  const { addToast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('🚗 Loading drivers...');

      // Mock data for now - will be replaced with real API call
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'John Smith',
          phone: '(203) 555-0123',
          email: 'john@fairfieldairportcars.com',
          status: 'available',
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2022,
            color: 'Silver',
            licensePlate: 'CT-ABC123'
          },
          rating: 4.8,
          totalRides: 156,
          location: {
            lat: 41.1408,
            lng: -73.2613,
            timestamp: new Date()
          },
          createdAt: new Date('2024-01-01')
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          phone: '(203) 555-0456',
          email: 'sarah@fairfieldairportcars.com',
          status: 'on-trip',
          vehicle: {
            make: 'Honda',
            model: 'Accord',
            year: 2021,
            color: 'Black',
            licensePlate: 'CT-DEF456'
          },
          rating: 4.9,
          totalRides: 203,
          createdAt: new Date('2024-01-15')
        },
        {
          id: '3',
          name: 'Mike Davis',
          phone: '(203) 555-0789',
          email: 'mike@fairfieldairportcars.com',
          status: 'offline',
          vehicle: {
            make: 'BMW',
            model: '3 Series',
            year: 2023,
            color: 'White',
            licensePlate: 'CT-GHI789'
          },
          rating: 4.7,
          totalRides: 98,
          createdAt: new Date('2024-02-01')
        },
        {
          id: '4',
          name: 'Emily Chen',
          phone: '(203) 555-0321',
          email: 'emily@fairfieldairportcars.com',
          status: 'available',
          vehicle: {
            make: 'Mercedes',
            model: 'E-Class',
            year: 2023,
            color: 'Black',
            licensePlate: 'CT-JKL321'
          },
          rating: 4.9,
          totalRides: 87,
          createdAt: new Date('2024-03-01')
        }
      ];

      console.log('✅ Drivers loaded:', mockDrivers.length);
      setDrivers(mockDrivers);
    } catch (err) {
      console.error('❌ Error loading drivers:', err);
      setError('Failed to load drivers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status: string) => {
    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'available':
          return {
            backgroundColor: '#dcfce7',
            color: '#166534',
            border: '1px solid #4ade80'
          };
        case 'on-trip':
          return {
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            border: '1px solid #60a5fa'
          };
        case 'offline':
          return {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db'
          };
        default:
          return {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db'
          };
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'available': return '🟢';
        case 'on-trip': return '🔵';
        case 'offline': return '⚫';
        default: return '⚫';
      }
    };

    return (
      <span
        style={{
          ...getStatusStyle(status),
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: '500',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)'
        }}
      >
        {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Header actions
  const headerActions = [
    { 
      label: 'Refresh',
      onClick: fetchDrivers,
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'View Locations', 
      href: '/admin/drivers/locations', 
      variant: 'outline' as const 
    },
    { 
      label: 'Add Driver', 
      onClick: () => addToast('info', 'Add driver functionality coming soon'), 
      variant: 'primary' as const 
    }
  ];

  // Table columns
  const columns: DataTableColumn<Driver>[] = [
    {
      key: 'name',
      label: 'Driver',
      sortable: true,
      render: (_, driver) => (
        <div>
          <div style={{ fontWeight: '500', marginBottom: 'var(--spacing-xs)' }}>
            {driver.name}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            📞 {driver.phone}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            📧 {driver.email}
          </div>
        </div>
      )
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      sortable: false,
      render: (_, driver) => (
        <div>
          <div style={{ fontWeight: '500', marginBottom: 'var(--spacing-xs)' }}>
            🚗 {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Color: {driver.vehicle.color}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Plate: {driver.vehicle.licensePlate}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => renderStatus(value)
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (_, driver) => (
        <div>
          <div style={{ fontWeight: '500', marginBottom: 'var(--spacing-xs)' }}>
            ⭐ {driver.rating.toFixed(1)}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            {driver.totalRides} rides
          </div>
        </div>
      )
    }
  ];

  // Table actions
  const actions: DataTableAction<Driver>[] = [
    {
      label: 'View',
      icon: '👁️',
      onClick: (driver) => addToast('info', `Viewing driver profile for ${driver.name}`),
      variant: 'outline'
    },
    {
      label: 'Assign Ride',
      icon: '🚗',
      onClick: (driver) => addToast('success', `Ride assignment feature for ${driver.name} coming soon`),
      variant: 'primary',
      condition: (driver) => driver.status === 'available'
    },
    {
      label: 'Location',
      icon: '📍',
      onClick: (driver) => addToast('info', `Live location tracking for ${driver.name} coming soon`),
      variant: 'outline',
      condition: (driver) => driver.status !== 'offline'
    },
    {
      label: 'Edit',
      icon: '✏️',
      onClick: (driver) => addToast('info', `Driver editing for ${driver.name} coming soon`),
      variant: 'outline'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      id: 1,
      icon: "👤",
      label: "Add New Driver",
      href: "/admin/drivers/new"
    },
    {
      id: 2,
      icon: "📍",
      label: "Live Driver Map",
      href: "/admin/drivers/locations"
    },
    {
      id: 3,
      icon: "⏰",
      label: "Schedule Management",
      href: "/admin/drivers/schedule"
    },
    {
      id: 4,
      icon: "📊",
      label: "Performance Reports",
      href: "/admin/drivers/reports"
    }
  ];

  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const onTripDrivers = drivers.filter(d => d.status === 'on-trip').length;
  const offlineDrivers = drivers.filter(d => d.status === 'offline').length;
  const avgRating = drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length) : 0;

  return (
    <AdminPageWrapper
      title="Driver Management"
      subtitle="Manage your drivers, track their status, and assign rides"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading drivers..."
      errorTitle="Driver Load Error"
    >
      {/* Driver Statistics */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title="Total Drivers"
          icon="👥"
          statNumber={drivers.length.toString()}
          statChange="Active in system"
          changeType="neutral"
        />
        <StatCard
          title="Available"
          icon="🟢"
          statNumber={availableDrivers.toString()}
          statChange="Ready for rides"
          changeType="positive"
        />
        <StatCard
          title="On Trip"
          icon="🔵"
          statNumber={onTripDrivers.toString()}
          statChange="Currently driving"
          changeType="neutral"
        />
        <StatCard
          title="Average Rating"
          icon="⭐"
          statNumber={avgRating.toFixed(1)}
          statChange={`Across ${drivers.reduce((sum, d) => sum + d.totalRides, 0)} total rides`}
          changeType="positive"
        />
      </GridSection>

      {/* Drivers Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🚗 All Drivers"
          description="Search, sort, and manage your driver fleet"
        >
          <DataTable
            data={drivers}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by driver name, vehicle, or status..."
            emptyMessage="No drivers found. Add your first driver to get started."
            emptyIcon="🚗"
            pageSize={10}
            rowClassName={(driver) => driver.status === 'offline' ? 'opacity-60' : ''}
            onRowClick={(driver) => console.log('Clicked driver:', driver.name)}
          />
        </InfoCard>
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="🎯 Quick Actions"
          description="Common driver management tasks and tools"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
}

export default function DriversPage() {
  return (
    <ToastProvider>
      <DriversPageContent />
    </ToastProvider>
  );
}