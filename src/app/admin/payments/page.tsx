'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import withAuth from '../withAuth';
import { getAllPayments, getPaymentsByStatus, updateDocument, type Payment } from '@/lib/services/database-service';
import { Container, Stack, LoadingSpinner, Text, Button } from '@/ui';

function PaymentsPageContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchPayments = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('💰 Fetching payments from database...');
      
      let fetchedPayments: Payment[];
      
      if (selectedStatus === 'all') {
        fetchedPayments = await getAllPayments();
      } else {
        fetchedPayments = await getPaymentsByStatus(selectedStatus as Payment['status']);
      }
      
      console.log('✅ Payments loaded from database:', fetchedPayments.length, 'payments');
      setPayments(fetchedPayments);
      
      if (fetchedPayments.length === 0) {
        console.log('📝 No payments found in database');
      }
    } catch (err) {
      console.error('❌ Error loading payments from database:', err);
      setError('Failed to load payments from database. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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

  const getPaymentStats = () => {
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const refundedPayments = payments.filter(p => p.status === 'refunded').length;
    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalRefunds = payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + (p.refundAmount || 0), 0);

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalAmount,
      totalRefunds,
      netRevenue: totalAmount - totalRefunds
    };
  };

  const handleRefund = async (payment: Payment) => {
    try {
      console.log(`🔄 Processing refund for payment ${payment.id}`);
      
      const refundAmount = payment.amount;
      const refundReason = 'Customer requested refund';
      
      await updateDocument('payments', payment.id, {
        status: 'refunded',
        refundAmount,
        refundReason,
      });
      
      // Update local state
      setPayments(prev => prev.map(p => 
        p.id === payment.id ? { 
          ...p, 
          status: 'refunded', 
          refundAmount, 
          refundReason 
        } : p
      ));
      
      console.log('✅ Refund processed successfully');
    } catch (err) {
      console.error('❌ Error processing refund:', err);
      setError('Failed to process refund');
    }
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    // Simple toast implementation - in production, use a proper toast library
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  if (loading) {
    return (
      <Container>
        <Stack align="center" spacing="lg">
          <LoadingSpinner />
          <Text>Loading payments from database...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Payments</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPayments}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = getPaymentStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-600">Track all payment transactions and manage refunds</p>
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
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPayments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedPayments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.netRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Payments</h2>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
              <p className="text-gray-600">No payments match your current filter criteria.</p>
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
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                          <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                          <div className="text-sm text-gray-500">Booking: {payment.bookingId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        {payment.refundAmount && (
                          <div className="text-xs text-red-600">
                            Refunded: {formatCurrency(payment.refundAmount, payment.currency)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' ? 'text-green-600 bg-green-100' :
                          payment.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                          payment.status === 'failed' ? 'text-red-600 bg-red-100' :
                          'text-purple-600 bg-purple-100'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="capitalize">{payment.paymentType}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {payment.status === 'completed' && (
                            <button
                              onClick={() => handleRefund(payment)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Refund
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
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

        {/* Payment Details Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Customer:</span> {selectedPayment.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedPayment.customerEmail}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {selectedPayment.status}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedPayment.paymentType}
                  </div>
                  <div>
                    <span className="font-medium">Method:</span> {selectedPayment.paymentMethod}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {formatDate(selectedPayment.createdAt)}
                  </div>
                  {selectedPayment.refundAmount && (
                    <div>
                      <span className="font-medium">Refund Amount:</span> {formatCurrency(selectedPayment.refundAmount, selectedPayment.currency)}
                    </div>
                  )}
                  {selectedPayment.refundReason && (
                    <div>
                      <span className="font-medium">Refund Reason:</span> {selectedPayment.refundReason}
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PaymentsPage: NextPage = () => {
  return <PaymentsPageContent />;
};

export default withAuth(PaymentsPage); 