'use client';

import { useEditMode } from '@/components/admin/EditModeProvider';
import { EditableTitle, EditableContent } from '@/components/admin/EditableField';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpPage() {
  const { handleFieldChange } = useEditMode();

  return (
    <PageContainer>
      <PageHeader title="Help & Support">
        <EditableTitle
          value="Help & Support"
          onChange={(value) => handleFieldChange('help', 'title', value)}
          className="text-3xl font-bold text-gray-900"
        />
      </PageHeader>
      <PageContent>
        <div className="max-w-4xl mx-auto">
          <EditableContent
            value={`
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600 mb-6">
                  Find answers to common questions about our airport transportation service.
                </p>
              </div>
            `}
            onChange={(value) => handleFieldChange('help', 'content', value)}
            className="prose prose-lg max-w-none mb-8"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How far in advance should I book?</h3>
                  <p className="text-gray-600">
                    We recommend booking at least 24 hours in advance to ensure availability. 
                    For same-day bookings, please call us directly.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What happens if my flight is delayed?</h3>
                  <p className="text-gray-600">
                    We monitor flight status and will adjust pickup times accordingly. 
                    If your flight is significantly delayed, please call us to update your booking.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you provide child seats?</h3>
                  <p className="text-gray-600">
                    Yes, we provide child seats upon request. Please specify the age and weight 
                    of your child when booking.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600">
                    We accept all major credit cards, cash, and digital payments. 
                    Payment is typically made at the end of your journey.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my booking?</h3>
                  <p className="text-gray-600">
                    Yes, you can cancel your booking up to 2 hours before pickup without charge. 
                    Cancellations within 2 hours may incur a fee.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                  <p className="text-gray-600">(555) 123-4567</p>
                  <p className="text-sm text-gray-500">Available 24/7</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-600">support@fairfieldairportcars.com</p>
                  <p className="text-sm text-gray-500">Response within 2 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
