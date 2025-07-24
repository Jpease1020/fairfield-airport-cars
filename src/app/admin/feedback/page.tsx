'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/data';

interface Feedback {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
}

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = async () => {
    try {
      // For now, we'll use mock data since the feedback service is for page comments
      // In a real implementation, this would fetch actual customer feedback
      const mockFeedback: Feedback[] = [
        {
          id: '1',
          bookingId: 'BK001',
          rating: 5,
          comment: 'Excellent service! Driver was on time and very professional.',
          createdAt: new Date('2024-01-15'),
          customerName: 'John Smith',
          customerEmail: 'john@example.com'
        },
        {
          id: '2',
          bookingId: 'BK002',
          rating: 4,
          comment: 'Good service overall. Clean vehicle and safe driving.',
          createdAt: new Date('2024-01-14'),
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.com'
        }
      ];
      setFeedback(mockFeedback);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading feedback..." />
        </div>
      </PageContainer>
    );
  }

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <PageContainer>
      <PageHeader title="Customer Feedback" />
      <PageContent>
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">No feedback found.</p>
              </CardContent>
            </Card>
          ) : (
            feedback.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.customerName}</h3>
                      <p className="text-sm text-gray-500">
                        {item.createdAt.toLocaleDateString()} at {item.createdAt.toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Booking ID: {item.bookingId}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-500 text-lg">
                        {getRatingStars(item.rating)}
                      </div>
                      <p className="text-sm text-gray-600">{item.rating}/5</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{item.comment}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Contact: {item.customerEmail}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default FeedbackPage; 