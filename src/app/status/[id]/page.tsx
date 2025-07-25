'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useBookingStatus, useEstimatedArrival } from '@/hooks/useBookingStatus';
import { BookingCardSkeleton } from '@/components/ui/skeleton';

export default function BookingStatusPage() {
  const params = useParams();
  const bookingId = params.id as string;
  
  const { status, loading, error } = useBookingStatus(bookingId);
  const { estimatedArrival } = useEstimatedArrival(bookingId);

  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    // Show skeleton for first 2 seconds to prevent flash
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSkeleton || loading) {
    return (
      <StandardLayout 
        title="Booking Status"
        subtitle="Track your airport transportation"
      >
        <div className="status-content">
          <BookingCardSkeleton />
        </div>
      </StandardLayout>
    );
  }

  if (error) {
    return (
      <StandardLayout 
        title="Booking Status"
        subtitle="Track your airport transportation"
      >
        <div className="status-content">
          <div className="error-state">
            <h2>Unable to Load Booking</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </StandardLayout>
    );
  }

  if (!status) {
    return (
      <StandardLayout 
        title="Booking Status"
        subtitle="Track your airport transportation"
      >
        <div className="status-content">
          <div className="not-found">
            <h2>Booking Not Found</h2>
            <p>The booking you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          </div>
        </div>
      </StandardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'in-progress': return '🚗';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '⏳';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <StandardLayout 
      title="Booking Status"
      subtitle="Track your airport transportation"
    >
      <div className="status-content">
        <div className="booking-status-card">
          <div className="status-header">
            <h2>Booking #{bookingId.slice(-8)}</h2>
            <div className={`status-badge ${getStatusColor(status.status)}`}>
              <span className="status-icon">{getStatusIcon(status.status)}</span>
              <span className="status-text">{status.status.replace('-', ' ').toUpperCase()}</span>
            </div>
          </div>

          <div className="status-details">
            {status.driverName && (
              <div className="detail-row">
                <span className="label">Driver:</span>
                <span className="value">{status.driverName}</span>
              </div>
            )}

            {estimatedArrival && (
              <div className="detail-row">
                <span className="label">Estimated Arrival:</span>
                <span className="value">{formatTime(estimatedArrival)}</span>
              </div>
            )}

            {status.lastUpdated && (
              <div className="detail-row">
                <span className="label">Last Updated:</span>
                <span className="value">{formatDateTime(status.lastUpdated)}</span>
              </div>
            )}
          </div>

          {/* Real-time status updates */}
          <div className="status-timeline">
            <h3>Booking Timeline</h3>
            <div className="timeline">
              <div className={`timeline-item ${status.status !== 'pending' ? 'completed' : ''}`}>
                <div className="timeline-icon">📝</div>
                <div className="timeline-content">
                  <h4>Booking Created</h4>
                  <p>Your booking has been received and is being processed</p>
                </div>
              </div>

              <div className={`timeline-item ${['confirmed', 'in-progress', 'completed'].includes(status.status) ? 'completed' : ''}`}>
                <div className="timeline-icon">✅</div>
                <div className="timeline-content">
                  <h4>Booking Confirmed</h4>
                  <p>Your booking has been confirmed and a driver has been assigned</p>
                </div>
              </div>

              <div className={`timeline-item ${['in-progress', 'completed'].includes(status.status) ? 'completed' : ''}`}>
                <div className="timeline-icon">🚗</div>
                <div className="timeline-content">
                  <h4>Driver En Route</h4>
                  <p>Your driver is on the way to your pickup location</p>
                </div>
              </div>

              <div className={`timeline-item ${status.status === 'completed' ? 'completed' : ''}`}>
                <div className="timeline-icon">🎉</div>
                <div className="timeline-content">
                  <h4>Journey Complete</h4>
                  <p>Your airport transportation has been completed successfully</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="status-actions">
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-secondary"
            >
              Back to Booking
            </button>
            
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-outline"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </StandardLayout>
  );
}
