
import type { NextPage } from 'next';

const SuccessPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-700">
          Thank you for your booking. You will receive a confirmation email shortly.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
