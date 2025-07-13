'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { createFeedback } from '@/lib/feedback-service';

// A simple star component
const Star = ({ filled, onClick }: { filled: boolean; onClick: () => void }) => (
  <svg
    onClick={onClick}
    className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.24 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
  </svg>
);

export default function FeedbackPage() {
  const params = useParams();
  const { id: bookingId } = params;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError(null);

    try {
      await createFeedback({
        bookingId: bookingId as string,
        rating,
        comments,
      });
      setSubmitted(true);
    } catch {
      setError('Sorry, there was an issue submitting your feedback. Please try again later.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h1>
          <p>Your feedback is greatly appreciated and helps us improve our service.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Leave Feedback</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 text-center mb-2">
              How was your ride?
            </label>
            <div className="flex justify-center" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                >
                  <Star
                    filled={star <= (hoverRating || rating)}
                    onClick={() => handleRating(star)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Any additional comments?
            </label>
            <textarea
              id="comments"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              placeholder="Tell us about your experience..."
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Submit Feedback
          </button>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
}
