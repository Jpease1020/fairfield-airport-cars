'use client';

import { useState, useEffect } from 'react';
import { 
  PageHeader, 
  GridSection, 
  StatCard, 
  InfoCard, 
  ActionGrid
} from '@/components/ui';
import { Button } from '@/components/ui/button';

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

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      }
    ];

    setDrivers(mockDrivers);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'status-badge confirmed';
      case 'on-trip': return 'status-badge pending';
      case 'offline': return 'badge';
      default: return 'badge';
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

  // Header actions
  const headerActions = [
    { 
      label: 'View Locations', 
      href: '/admin/drivers/locations', 
      variant: 'outline' as const 
    },
    { 
      label: 'Add Driver', 
      onClick: () => alert('Add driver functionality coming soon'), 
      variant: 'primary' as const 
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
      label: "View Driver Locations",
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
      label: "Driver Reports",
      href: "/admin/drivers/reports"
    }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <PageHeader
          title="Driver Management"
          subtitle="Loading drivers..."
        />
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading drivers...</p>
        </div>
      </div>
    );
  }

  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const onTripDrivers = drivers.filter(d => d.status === 'on-trip').length;
  const avgRating = drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length) : 0;

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Driver Management"
        subtitle="Manage your drivers, track their status, and assign rides"
        actions={headerActions}
      />

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
          icon="📍"
          statNumber={availableDrivers.toString()}
          statChange="Ready for rides"
          changeType="positive"
        />
        <StatCard
          title="On Trip"
          icon="⏰"
          statNumber={onTripDrivers.toString()}
          statChange="Currently driving"
          changeType="neutral"
        />
        <StatCard
          title="Avg Rating"
          icon="⭐"
          statNumber={avgRating.toFixed(1)}
          statChange="Driver performance"
          changeType="positive"
        />
      </GridSection>

      <GridSection variant="content" columns={1}>
        <InfoCard
          title="Active Drivers"
          description={`Showing ${drivers.length} drivers in the system`}
        >
          <div className="drivers-list">
            {drivers.map((driver) => (
              <div key={driver.id} className="driver-card">
                <div className="driver-header">
                  <div className="driver-avatar">
                    <div className="driver-initials">
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  
                  <div className="driver-info">
                    <div className="driver-name-row">
                      <h3 className="driver-name">{driver.name}</h3>
                      <span className={getStatusColor(driver.status)}>
                        {getStatusIcon(driver.status)} {driver.status}
                      </span>
                    </div>
                    
                    <div className="driver-contact">
                      <div className="contact-item">
                        <span className="contact-icon">📞</span>
                        <span>{driver.phone}</span>
                      </div>
                      <div className="contact-item">
                        <span className="contact-icon">📧</span>
                        <span>{driver.email}</span>
                      </div>
                      <div className="contact-item">
                        <span className="contact-icon">⭐</span>
                        <span>{driver.rating} ({driver.totalRides} rides)</span>
                      </div>
                    </div>
                    
                    <div className="driver-vehicle">
                      <div className="vehicle-info">
                        <span className="vehicle-icon">🚗</span>
                        <span>{driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model} - {driver.vehicle.color}</span>
                      </div>
                      <div className="license-plate">
                        {driver.vehicle.licensePlate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="driver-actions">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Assign Ride
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="Quick Actions"
          description="Common driver management tasks"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>
    </div>
  );
} 