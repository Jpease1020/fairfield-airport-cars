
import type { NextPage } from 'next';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';

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
    <PageContainer maxWidth="xl" padding="lg">
      <PageHeader 
        title="Help & FAQs" 
        subtitle="Find answers to common questions about our service"
      />
      <PageContent>
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-base text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Us
              </h2>
              <p className="text-base text-gray-600 mb-6">
                If you can&apos;t find the answer you&apos;re looking for, please don&apos;t hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:+1-203-555-0123"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center font-medium"
                >
                  Click to Call
                </a>
                <a 
                  href="sms:+1-203-555-0123"
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center font-medium"
                >
                  Click to Text
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default HelpPage;
