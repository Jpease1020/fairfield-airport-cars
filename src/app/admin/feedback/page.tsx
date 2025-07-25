'use client';

import { useState, useEffect } from 'react';

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
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Customer Feedback</h1>
        <p className="page-subtitle">Reviews and ratings from your customers</p>
      </div>

      <div className="standard-content">
        {feedback.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">⭐</div>
                <p>No feedback found.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-1 gap-lg">
            {feedback.map((item) => (
              <div key={item.id} className="card">
                <div className="card-body">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{item.customerName}</h3>
                      <p className="card-description">
                        {item.createdAt.toLocaleDateString()} at {item.createdAt.toLocaleTimeString()}
                      </p>
                      <p className="card-description">
                        Booking ID: {item.bookingId}
                      </p>
                    </div>
                    <div className="rating-display">
                      <div className="rating-stars">
                        {getRatingStars(item.rating)}
                      </div>
                      <p className="rating-score">{item.rating}/5</p>
                    </div>
                  </div>
                  <div className="comment-content">
                    <p>{item.comment}</p>
                  </div>
                  <div className="contact-info">
                    <p className="card-description">
                      Contact: {item.customerEmail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage; 