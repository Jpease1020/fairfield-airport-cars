
"use client";

import type { NextPage } from 'next';
import BookingForm from './booking-form';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';

const BookPage: NextPage = () => {
  return (
    <PageContainer maxWidth="2xl" padding="lg">
      <PageHeader 
        title="Book Your Ride" 
        subtitle="Premium airport transportation service"
      />
      <PageContent>
        <Card>
          <CardContent className="p-8">
            <BookingForm />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default BookPage;
