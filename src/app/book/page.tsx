
"use client";

import type { NextPage } from 'next';
import BookingForm from './booking-form';

const BookPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card p-8 rounded-lg shadow-lg border">
        <h1 className="text-3xl font-bold text-center mb-8 text-card-foreground">Book Your Ride</h1>
        <BookingForm />
      </div>
    </div>
  );
};

export default BookPage;
