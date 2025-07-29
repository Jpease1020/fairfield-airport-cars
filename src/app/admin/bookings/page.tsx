'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import withAuth from '../withAuth';
import { getAllBookings, getBookingsByStatus, updateDocument, deleteDocument, type Booking } from '@/lib/services/database-service';

function AdminBookingsPageContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 Fetching bookings from database...');
      
      let fetchedBookings: Booking[];
      
      if (selectedStatus === 'all') {
        fetchedBookings = await getAllBookings();
      } else {
        fetchedBookings = await getBookingsByStatus(selectedStatus as Booking['status']);
      }
      
      console.log('✅ Bookings fetched from database:', fetchedBookings.length, 'bookings');
      setBookings(fetchedBookings);
      
      if (fetchedBookings.length === 0) {
        console.log('📝 No bookings found in database');
      }
    } catch (err) {
      console.error('❌ Error fetching bookings from database:', err);
      setError('Failed to load bookings from database');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (booking: Booking, newStatus: Booking['status']) => {
    try {
      console.log(`🔄 Updating booking ${booking.id} status to ${newStatus}`);
      
      await updateDocument('bookings', booking.id!, { status: newStatus });
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));
      
      console.log('✅ Booking status updated successfully');
    } catch (err) {
      console.error('❌ Error updating booking status:', err);
      setError('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      console.log(`🗑️ Deleting booking ${booking.id}`);
      
      await deleteDocument('bookings', booking.id!);
      
      // Remove from local state
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      
      console.log('✅ Booking deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting booking:', err);
      setError('Failed to delete booking');
    }
  };

  const handleDriverAssignment = async (booking: Booking) => {
    try {
      console.log(`👨‍💼 Assigning driver to booking ${booking.id}`);
      
      // For now, assign Gregg as the default driver
      const driverId = 'gregg-main-driver';
      const driverName = 'Gregg';
      
      await updateDocument('bookings', booking.id!, { 
        driverId, 
        driverName 
      });
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, driverId, driverName } : b
      ));
      
      console.log('✅ Driver assigned successfully');
    } catch (err) {
      console.error('❌ Error assigning driver:', err);
      setError('Failed to assign driver');
    }
  };

  const renderStatus = (status: string) => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending': return '⏳';
        case 'confirmed': return '✅';
        case 'in-progress': return '🚗';
        case 'completed': return '🎉';
        case 'cancelled': return '❌';
        default: return '❓';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'text-yellow-600 bg-yellow-100';
        case 'confirmed': return 'text-green-600 bg-green-100';
        case 'in-progress': return 'text-blue-600 bg-blue-100';
        case 'completed': return 'text-purple-600 bg-purple-100';
        case 'cancelled': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {getStatusIcon(status)} {status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Bookings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchBookings}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">Manage all customer bookings and track their status</p>
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
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🚗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookings.filter(b => b.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(bookings.reduce((sum, b) => sum + b.fare, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Bookings</h2>
          </div>
          
          {bookings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600">No bookings match your current filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fare
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                          <div className="text-sm text-gray-500">{booking.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">From:</span> {booking.pickupLocation}
                          </div>
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">To:</span> {booking.dropoffLocation}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.passengers} passenger{booking.passengers !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.pickupDateTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatus(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.fare)}
                        </div>
                        {booking.balanceDue > 0 && (
                          <div className="text-xs text-red-600">
                            Balance: {formatCurrency(booking.balanceDue)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(booking, 'confirmed')}
                            disabled={booking.status === 'confirmed'}
                            className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDriverAssignment(booking)}
                            disabled={!!booking.driverId}
                            className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                          >
                            Assign Driver
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
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

const AdminBookingsPage: NextPage = () => {
  return <AdminBookingsPageContent />;
};

export default withAuth(AdminBookingsPage);
