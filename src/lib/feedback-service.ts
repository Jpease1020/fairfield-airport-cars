import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface FeedbackData {
  bookingId: string;
  rating: number;
  comments: string;
}

const feedbackCollection = collection(db, 'feedback');

export const createFeedback = async (feedbackData: FeedbackData) => {
  try {
    await addDoc(feedbackCollection, {
      ...feedbackData,
      createdAt: serverTimestamp(),
    });
    console.log('Feedback submitted successfully');
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error('Failed to submit feedback.');
  }
};
