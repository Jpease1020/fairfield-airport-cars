'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  StatusMessage,
  LoadingSpinner
} from '@/components/ui';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/get-booking/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      } else {
        setError('Could not load booking details');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Could not load booking details');
    } finally {
      setLoading(false);
    }
  };

  const successActions = [
    {
      label: 'View Booking Details',
      onClick: () => window.location.href = `/booking/${bookingId}`,
      variant: 'primary' as const,
      icon: '📋'
    },
    {
      label: 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'outline' as const,
      icon: '🚗'
    },
    {
      label: 'Contact Support',
      onClick: () => window.location.href = '/help',
      variant: 'outline' as const,
      icon: '📞'
    }
  ];

  if (loading) {
    return (
      <LayoutEnforcer>
        <UniversalLayout 
          layoutType="standard"
          title="Processing..."
          subtitle="Loading your booking confirmation"
        >
          <GridSection variant="content" columns={1}>
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <LoadingSpinner size="lg" />
              <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                Loading your booking details...
              </p>
            </div>
          </GridSection>
        </UniversalLayout>
      </LayoutEnforcer>
    );
  }

  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="🎉 Booking Confirmed!"
        subtitle={booking?.depositPaid ? "Payment successful - You're all set!" : "Your booking is confirmed"}
      >
        {error && (
          <GridSection variant="content" columns={1}>
            <StatusMessage 
              type="warning" 
              message={error} 
              onDismiss={() => setError(null)}
            />
          </GridSection>
        )}

        {/* Success Message */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title={booking?.depositPaid ? "✅ Payment Successful!" : "📝 Booking Created!"}
            description={booking?.depositPaid 
              ? "Your deposit has been processed and your ride is confirmed"
              : "Your booking has been created. Payment can be completed before your ride"
            }
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg) 0'
            }}>
              {/* Booking Reference */}
              <div style={{ 
                textAlign: 'center',
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--background-secondary)',
                borderRadius: 'var(--border-radius)',
                border: '2px solid var(--brand-primary)'
              }}>
                <h3 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--brand-primary)' }}>
                  Your Booking Reference
                </h3>
                <p style={{ 
                  fontSize: 'var(--font-size-xl)', 
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)'
                }}>
                  {bookingId}
                </p>
              </div>

              {/* Booking Details */}
              {booking && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 'var(--spacing-md)'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>🚗 Trip Details</h4>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0' }}>
                      <strong>From:</strong> {booking.pickupLocation}
                    </p>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0' }}>
                      <strong>To:</strong> {booking.dropoffLocation}
                    </p>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0' }}>
                      <strong>When:</strong> {new Date(booking.pickupDateTime).toLocaleString()}
                    </p>
                    <p style={{ margin: '0' }}>
                      <strong>Passengers:</strong> {booking.passengers}
                    </p>
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>💰 Payment Status</h4>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0' }}>
                      <strong>Total Fare:</strong> ${booking.fare}
                    </p>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0' }}>
                      <strong>Deposit:</strong> ${booking.depositAmount} {booking.depositPaid ? '✅ Paid' : '⏳ Pending'}
                    </p>
                    <p style={{ margin: '0' }}>
                      <strong>Balance Due:</strong> ${booking.balanceDue || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>
        </GridSection>

        {/* Next Steps */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📋 What Happens Next?"
            description="Here's what you can expect from us"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md) 0'
            }}>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)'
              }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '1.5rem' }}>📧</span>
                  <span>You&apos;ll receive a confirmation email with all booking details</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '1.5rem' }}>📱</span>
                  <span>We&apos;ll send you SMS updates about your driver and pickup time</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '1.5rem' }}>👨‍💼</span>
                  <span>Your driver will contact you 30 minutes before pickup</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '1.5rem' }}>✈️</span>
                  <span>We monitor your flight for any delays or changes</span>
                </li>
              </ul>

              <ActionButtonGroup buttons={successActions} />
            </div>
          </InfoCard>
        </GridSection>

        {/* Emergency Contact */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🆘 Need Help?"
            description="Contact us anytime if you have questions or need to make changes"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
              textAlign: 'center'
            }}>
              <div>
                <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>24/7 Support</h4>
                <p style={{ 
                  fontSize: 'var(--font-size-lg)', 
                  fontWeight: '600',
                  margin: 0,
                  color: 'var(--brand-primary)'
                }}>
                  📞 (203) 555-0123
                </p>
              </div>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                Save this number! Our drivers are available to assist you.
              </p>
            </div>
          </InfoCard>
        </GridSection>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}
