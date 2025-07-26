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
            color: 'Blue',
            licensePlate: 'CT-JKL012'
          },
          rating: 4.6,
          totalRides: 87,
          createdAt: new Date('2024-02-15')
        }
      ];
      
      console.log('✅ Drivers loaded:', mockDrivers.length, 'drivers');
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
            border: '1px solid #22c55e'
          };
        case 'on-trip':
          return {
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            border: '1px solid #3b82f6'
          };
        case 'offline':
          return {
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #ef4444'
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
        case 'available':
          return '✅';
        case 'on-trip':
          return '🚗';
        case 'offline':
          return '⏸️';
        default:
          return '❓';
      }
    };

    return (
      <span className="status-badge">
        {getStatusIcon(status)} {status}
      </span>
    );
  };

  // Calculate driver stats
  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const onTripDrivers = drivers.filter(d => d.status === 'on-trip').length;
  const averageRating = drivers.length > 0 
    ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)
    : '0.0';

  // Table columns
  const columns: DataTableColumn<Driver>[] = [
    {
      key: 'name',
      label: 'Driver',
      sortable: true,
      render: (_, driver) => (
        <div className="driver-info">
          <div className="driver-name">
            {driver.name}
          </div>
          <div className="driver-contact">
            📞 {driver.phone}
          </div>
          <div className="driver-contact">
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
        <div className="vehicle-info">
          <div className="vehicle-name">
            🚗 {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
          </div>
          <div className="vehicle-details">
            Color: {driver.vehicle.color}
          </div>
          <div className="vehicle-details">
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
        <div className="rating-info">
          <div className="rating-score">
            ⭐ {driver.rating.toFixed(1)}
          </div>
          <div className="rating-rides">
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
      href: "/admin/drivers/map"
    },
    {
      id: 3,
      icon: "📊",
      label: "Driver Analytics",
      href: "/admin/drivers/analytics"
    },
    {
      id: 4,
      icon: "⚙️",
      label: "Driver Settings",
      href: "/admin/drivers/settings"
    }
  ];

  return (
    <AdminPageWrapper
      title="Driver Management"
      subtitle="Manage your fleet of professional drivers"
      loading={loading}
      error={error}
      loadingMessage="Loading driver data..."
      errorTitle="Driver Load Error"
    >
      {/* Driver Statistics */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title="Total Drivers"
          icon="👥"
          statNumber={totalDrivers.toString()}
          statChange="Active fleet"
          changeType="neutral"
        />
        <StatCard
          title="Available"
          icon="✅"
          statNumber={availableDrivers.toString()}
          statChange="Ready for rides"
          changeType="positive"
        />
        <StatCard
          title="On Trip"
          icon="🚗"
          statNumber={onTripDrivers.toString()}
          statChange="Currently driving"
          changeType="neutral"
        />
        <StatCard
          title="Average Rating"
          icon="⭐"
          statNumber={averageRating}
          statChange="Customer satisfaction"
          changeType="positive"
        />
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🚀 Quick Actions"
          description="Common driver management tasks"
        >
          <ActionGrid actions={quickActions} />
        </InfoCard>
      </GridSection>

      {/* Drivers Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="👥 All Drivers"
          description="View and manage your complete driver roster"
        >
          <DataTable
            data={drivers}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by driver name, phone, or vehicle..."
            emptyMessage="No drivers found. Add your first driver to get started."
            emptyIcon="👤"
            pageSize={10}
            rowClassName={(driver) => 
              driver.status === 'offline' ? 'opacity-60' : ''
            }
            onRowClick={(driver) => console.log('Clicked driver:', driver.name)}
          />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
}

const DriversPage = () => {
  return (
    <ToastProvider>
      <DriversPageContent />
    </ToastProvider>
  );
};

export default DriversPage;
