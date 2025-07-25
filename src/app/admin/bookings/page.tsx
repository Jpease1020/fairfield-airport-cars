'use client';

import { useState, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import { Booking } from '@/types/booking';
import { listBookings, updateBooking, deleteBooking } from '@/lib/services/booking-service';
import withAuth from '../withAuth';

const AdminBookingsPage: NextPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Booking['status'] | 'all'>('all');
  const [sortConfig] = useState<{ key: keyof Booking; direction: 'ascending' | 'descending' } | null>({ key: 'pickupDateTime', direction: 'ascending' });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await listBookings();
      setBookings(bookingsData);
    } catch {
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const sortedAndFilteredBookings = useMemo(() => {
    let sortableItems = [...bookings];
    if (filterStatus !== 'all') {
      sortableItems = sortableItems.filter(booking => booking.status === filterStatus);
    }
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue && bValue && aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue && bValue && aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [bookings, filterStatus, sortConfig]);

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await updateBooking(bookingId, { status: newStatus });
      fetchBookings();
    } catch {
      setError('Failed to update booking status.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteBooking(bookingId);
        fetchBookings();
      } catch {
        setError('Failed to cancel booking.');
      }
    }
  };

  const handleSendFeedbackRequest = async (bookingId: string) => {
    try {
      const response = await fetch('/api/send-feedback-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (response.ok) {
        alert('Feedback request sent successfully!');
      } else {
        throw new Error('Failed to send feedback request.');
      }
    } catch {
      setError('Failed to send feedback request.');
    }
  };

  const totalRevenue = useMemo(() => bookings.reduce((sum, b) => sum + (b.fare || 0) + (b.tipAmount || 0) - (b.cancellationFee || 0), 0), [bookings]);
  const totalTips = useMemo(()=> bookings.reduce((s,b)=> s + (b.tipAmount||0),0),[bookings]);
  const totalCancFees = useMemo(()=> bookings.reduce((s,b)=> s + (b.cancellationFee||0),0),[bookings]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="alert error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-badge pending';
      case 'confirmed': return 'status-badge confirmed';
      case 'completed': return 'status-badge completed';
      case 'cancelled': return 'status-badge cancelled';
      default: return 'status-badge';
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Booking Dashboard</h1>
        <p className="page-subtitle">
          Month-to-date revenue: {formatPrice(totalRevenue)} | Tips: {formatPrice(totalTips)} | Cancellation fees: {formatPrice(totalCancFees)}
        </p>
      </div>

      <div className="standard-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">All Bookings</h2>
            <div className="card-actions">
              <div className="form-group inline">
                <label className="form-label">Filter by status:</label>
                <select
                  className="form-input"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as Booking['status'] | 'all')}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body">
            {sortedAndFilteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <p>No bookings found</p>
              </div>
            ) : (
              <div className="bookings-table-container">
                <table className="data-table bookings-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Pickup / Drop-off</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Fare</th>
                      <th>Tip</th>
                      <th>Cancel Fee</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAndFilteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="customer-cell">
                          <div className="customer-info">
                            <div className="customer-name">{booking.name}</div>
                            <div className="customer-contact">{booking.email}</div>
                            <div className="customer-contact">{booking.phone}</div>
                          </div>
                        </td>
                        <td className="location-cell">
                          <div className="location-info">
                            <div className="pickup-location">{booking.pickupLocation}</div>
                            <div className="dropoff-location">{booking.dropoffLocation}</div>
                          </div>
                        </td>
                        <td className="datetime-cell">
                          {formatDateTime(booking.pickupDateTime)}
                        </td>
                        <td className="status-cell">
                          <span className={getStatusBadgeClass(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="fare-cell">
                          {formatPrice(booking.fare)}
                        </td>
                        <td className="tip-cell">
                          {formatPrice(booking.tipAmount || 0)}
                        </td>
                        <td className="fee-cell">
                          {formatPrice(booking.cancellationFee || 0)}
                        </td>
                        <td className="actions-cell">
                          <div className="booking-actions">
                            <div className="status-selector">
                              <select
                                className="form-input booking-status-select"
                                value={booking.status}
                                onChange={(e) => {
                                  if (booking.id) {
                                    handleStatusChange(booking.id, e.target.value as Booking['status']);
                                  }
                                }}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div className="action-buttons">
                              <button 
                                className="btn btn-destructive btn-sm"
                                onClick={() => {
                                  if (booking.id) {
                                    handleCancelBooking(booking.id);
                                  }
                                }}
                                title="Cancel booking"
                              >
                                ❌
                              </button>
                              <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  if (booking.id) {
                                    handleSendFeedbackRequest(booking.id);
                                  }
                                }}
                                title="Send feedback request"
                              >
                                📧
                              </button>
                            </div>
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
    </div>
  );
};

export default withAuth(AdminBookingsPage);