import { notFound } from 'next/navigation';
import TestEmailPageClient from './TestEmailPageClient';

export default function TestEmailPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <TestEmailPageClient />;
}
