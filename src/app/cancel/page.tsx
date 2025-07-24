
'use client';

import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <PageContainer>
      <PageHeader title="Cancel Booking" />
      <PageContent>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Cancel Your Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Cancellation Policy</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Cancellations made 24+ hours before pickup: No charge</li>
                  <li>• Cancellations made 2-24 hours before pickup: 25% of fare</li>
                  <li>• Cancellations made less than 2 hours before pickup: 50% of fare</li>
                  <li>• No-shows: Full fare charged</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">To cancel your booking:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-1">
                      <span className="text-blue-600 text-sm font-medium">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Contact us immediately</p>
                      <p className="text-sm text-gray-600">Call or email us as soon as possible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-1">
                      <span className="text-blue-600 text-sm font-medium">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Provide booking details</p>
                      <p className="text-sm text-gray-600">Have your booking ID ready</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-1">
                      <span className="text-blue-600 text-sm font-medium">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Confirm cancellation</p>
                      <p className="text-sm text-gray-600">We&apos;ll send you a confirmation email</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">cancellations@fairfieldairportcars.com</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/">
                  <Button variant="outline">
                    Return to Home
                  </Button>
                </Link>
                <Link href="/book">
                  <Button>
                    Book New Ride
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}


