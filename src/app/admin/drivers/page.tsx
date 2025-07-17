'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/data';
import { 
  UserPlus, 
  MapPin, 
  Clock, 
  Star,
  Car,
  Phone,
  Mail
} from 'lucide-react';

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
      case 'available': return 'bg-green-100 text-green-800';
      case 'on-trip': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading drivers..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Driver Management" 
        subtitle="Manage your drivers, track their status, and assign rides."
      >
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Driver
        </Button>
      </PageHeader>

      <PageContent>
        {/* Driver Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Total Drivers</p>
                  <p className="text-2xl font-bold text-text-primary">{drivers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Available</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {drivers.filter(d => d.status === 'available').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">On Trip</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {drivers.filter(d => d.status === 'on-trip').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Avg Rating</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drivers List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div key={driver.id} className="border border-border-primary rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center">
                          <span className="text-text-inverse font-semibold">
                            {driver.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-text-primary">{driver.name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                            {getStatusIcon(driver.status)} {driver.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {driver.phone}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {driver.email}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {driver.rating} ({driver.totalRides} rides)
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                          <div className="flex items-center">
                            <Car className="w-4 h-4 mr-1" />
                            {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model} - {driver.vehicle.color}
                          </div>
                          <div className="text-xs bg-bg-secondary px-2 py-1 rounded">
                            {driver.vehicle.licensePlate}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <UserPlus className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Add New Driver</span>
              </div>
            </Button>
            
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <MapPin className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">View Driver Locations</span>
              </div>
            </Button>
            
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Schedule Management</span>
              </div>
            </Button>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
} 