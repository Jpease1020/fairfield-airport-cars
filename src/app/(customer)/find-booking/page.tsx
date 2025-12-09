import { Metadata } from 'next';
import FindBookingClient from './FindBookingClient';

export const metadata: Metadata = {
  title: 'Find My Booking | Fairfield Airport Cars',
  description: 'Look up your booking using your email or phone number',
};

export default function FindBookingPage() {
  return <FindBookingClient />;
}

