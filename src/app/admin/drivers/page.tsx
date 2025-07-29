'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import withAuth from '../withAuth';
import { getAllDrivers, getAvailableDrivers, updateDocument, type Driver } from '@/lib/services/database-service';

function DriversPageContent() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchDrivers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('👨‍💼 Loading drivers from database...');

      let fetchedDrivers: Driver[];
      
      if (selectedStatus === 'available') {
        fetchedDrivers = await getAvailableDrivers();
      } else {
        fetchedDrivers = await getAllDrivers();
      }
      
      console.log('✅ Drivers loaded from database:', fetchedDrivers.length, 'drivers');
      setDrivers(fetchedDrivers);
      
      if (fetchedDrivers.length === 0) {
        console.log('📝 No drivers found in database');
      }
    } catch (err) {
      console.error('❌ Error loading drivers from database:', err);
      setError('Failed to load drivers from database. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleStatusUpdate = async (driver: Driver, newStatus: Driver['status']) => {
    try {
      console.log(`🔄 Updating driver ${driver.id} status to ${newStatus}`);
      
      await updateDocument('drivers', driver.id, { status: newStatus });
      
      // Update local state
      setDrivers(prev => prev.map(d => 
        d.id === driver.id ? { ...d, status: newStatus } : d
      ));
      
      console.log('✅ Driver status updated successfully');
    } catch (err) {
      console.error('❌ Error updating driver status:', err);
      setError('Failed to update driver status');
    }
  };

  const renderStatus = (status: string) => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'available': return '✅';
        case 'busy': return '🚗';
        case 'offline': return '⏸️';
        default: return '❓';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'available': return 'text-green-600 bg-green-100';
        case 'busy': return 'text-blue-600 bg-blue-100';
        case 'offline': return 'text-gray-600 bg-gray-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {getStatusIcon(status)} {status}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drivers from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Drivers</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDrivers}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Management</h1>
          <p className="text-gray-600">Manage driver profiles, availability, and assignments</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Drivers</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👨‍💼</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-semibold text-gray-900">{drivers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {drivers.filter(d => d.status === 'available').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🚗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Trip</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {drivers.filter(d => d.status === 'busy').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-2xl">⏸️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {drivers.filter(d => d.status === 'offline').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Drivers</h2>
          </div>
          
          {drivers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">👨‍💼</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Drivers Found</h3>
              <p className="text-gray-600">No drivers match your current filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.email}</div>
                          <div className="text-sm text-gray-500">{driver.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {driver.vehicleInfo.make} {driver.vehicleInfo.model} ({driver.vehicleInfo.year})
                          </div>
                          <div className="text-sm text-gray-500">
                            {driver.vehicleInfo.color} • {driver.vehicleInfo.licensePlate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatus(driver.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {driver.rating ? `${driver.rating}/5.0` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {driver.totalRides ? `${driver.totalRides} rides` : 'No rides yet'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(driver.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(driver, 'available')}
                            disabled={driver.status === 'available'}
                            className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                          >
                            Set Available
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(driver, 'busy')}
                            disabled={driver.status === 'busy'}
                            className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                          >
                            Set Busy
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(driver, 'offline')}
                            disabled={driver.status === 'offline'}
                            className="text-gray-600 hover:text-gray-900 disabled:text-gray-400"
                          >
                            Set Offline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DriversPage: NextPage = () => {
  return <DriversPageContent />;
};

export default withAuth(DriversPage);
