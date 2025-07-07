'use client';

import { useState, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import { Booking } from '@/types/booking';
import { listBookings, updateBooking, deleteBooking } from '@/lib/booking-service';
import withAuth from '../withAuth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminBookingsPage: NextPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Booking['status'] | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: 'ascending' | 'descending' } | null>({ key: 'pickupDateTime', direction: 'ascending' });

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

  const requestSort = (key: keyof Booking) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

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

  if (loading) {
    return <div className="min-h-screen bg-background p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-background p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Booking Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 pb-4">
            <label className="text-sm font-medium">Filter by status:</label>
            <div className="dropdown-container">
              <Select onValueChange={(value: "pending" | "confirmed" | "completed" | "cancelled") => setFilterStatus(value)} defaultValue="all">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Pickup / Drop-off</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('pickupDateTime')}>Date & Time</Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('status')}>Status</Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('fare')}>Fare</Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.name}</div>
                    <div>{booking.email}</div>
                    <div>{booking.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div>{booking.pickupLocation}</div>
                    <div>{booking.dropoffLocation}</div>
                  </TableCell>
                  <TableCell>
                    <div>{new Date(booking.pickupDateTime).toLocaleDateString()}</div>
                    <div>{new Date(booking.pickupDateTime).toLocaleTimeString()}</div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell>${booking.fare}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <Select onValueChange={(value: "pending" | "confirmed" | "completed" | "cancelled") => {
                        if (booking.id) {
                          handleStatusChange(booking.id, value)
                        }
                      }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={() => {
                          if (booking.id) {
                            handleCancelBooking(booking.id)
                          }
                        }}>Cancel</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          if (booking.id) {
                            handleSendFeedbackRequest(booking.id)
                          }
                        }}>Feedback</Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(AdminBookingsPage);