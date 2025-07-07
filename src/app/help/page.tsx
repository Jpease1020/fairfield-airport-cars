
import type { NextPage } from 'next';

const faqs = [
  {
    question: 'Which airports do you serve?',
    answer: 'We provide service to and from all major airports in the New York and Connecticut area, including JFK, LaGuardia (LGA), Newark (EWR), Westchester (HPN), and Bradley (BDL).',
  },
  {
    question: 'How far in advance should I book my ride?',
    answer: 'We recommend booking at least 24 hours in advance to ensure availability. However, we will always do our best to accommodate last-minute requests.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'You can cancel for a full refund up to 12 hours before your scheduled pickup time. Cancellations within 12 hours of pickup are non-refundable.',
  },
  {
    question: 'What kind of vehicle will I be riding in?',
    answer: 'You will be riding in a modern, clean, and comfortable black SUV, typically a Chevrolet Suburban or similar, equipped with complimentary water, Wi-Fi, and phone chargers.',
  },
];

const HelpPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          Help & FAQs
        </h1>

        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-base text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Us
            </h2>
            <p className="text-base text-gray-600 mb-6">
              If you can't find the answer you're looking for, please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <a
                href="tel:+1-203-555-0123" // Replace with Gregg's actual phone number
                className="w-full text-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Click to Call
              </a>
              <a
                href="sms:+1-203-555-0123" // Replace with Gregg's actual phone number
                className="w-full text-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Click to Text
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
