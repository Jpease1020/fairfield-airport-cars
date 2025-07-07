
import type { NextPage } from 'next';

const CancelPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Canceled</h1>
        <p className="text-gray-700">
          Your payment was canceled. Please try again.
        </p>
      </div>
    </div>
  );
};

export default CancelPage;
