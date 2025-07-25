'use client';

import { useState, useEffect } from 'react';

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

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Driver Management</h1>
        <p className="page-subtitle">Manage your drivers, track their status, and assign rides.</p>
        <div className="header-actions">
          <button className="btn btn-primary">
            <span className="btn-icon">👤</span>
            Add Driver
          </button>
        </div>
      </div>

      <div className="standard-content">
        {/* Driver Stats */}
        <div className="grid grid-4 gap-lg">
          <div className="card">
            <div className="card-body">
              <div className="stat-display">
                <div className="stat-content">
                  <div className="stat-label">Total Drivers</div>
                  <div className="stat-number">{drivers.length}</div>
                </div>
                <div className="stat-icon">👥</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="stat-display">
                <div className="stat-content">
                  <div className="stat-label">Available</div>
                  <div className="stat-number">
                    {drivers.filter(d => d.status === 'available').length}
                  </div>
                </div>
                <div className="stat-icon">📍</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="stat-display">
                <div className="stat-content">
                  <div className="stat-label">On Trip</div>
                  <div className="stat-number">
                    {drivers.filter(d => d.status === 'on-trip').length}
                  </div>
                </div>
                <div className="stat-icon">⏰</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="stat-display">
                <div className="stat-content">
                  <div className="stat-label">Avg Rating</div>
                  <div className="stat-number">
                    {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
                  </div>
                </div>
                <div className="stat-icon">⭐</div>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Active Drivers</h2>
          </div>
          <div className="card-body">
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
                      <button className="btn btn-outline btn-sm">
                        View Details
                      </button>
                      <button className="btn btn-outline btn-sm">
                        Assign Ride
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="quick-action-card">
                <div className="action-icon">👤</div>
                <span className="action-label">Add New Driver</span>
              </button>
              
              <button className="quick-action-card">
                <div className="action-icon">📍</div>
                <span className="action-label">View Driver Locations</span>
              </button>
              
              <button className="quick-action-card">
                <div className="action-icon">⏰</div>
                <span className="action-label">Schedule Management</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 