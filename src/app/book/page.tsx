
"use client";

import { useEditMode } from '@/components/admin/EditModeProvider';
import { EditableTitle, EditableSubtitle, EditableContent } from '@/components/admin/EditableField';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import BookingForm from './booking-form';

export default function BookPage() {
  const { handleFieldChange } = useEditMode();

  return (
    <PageContainer>
      <PageContent>
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <EditableTitle
              value="Book Your Airport Transfer"
              onChange={(value) => handleFieldChange('book', 'title', value)}
              className="text-3xl font-bold text-gray-900 mb-2"
            />
            <EditableSubtitle
              value="Reliable, comfortable transportation to and from Fairfield Airport"
              onChange={(value) => handleFieldChange('book', 'subtitle', value)}
              className="text-lg text-gray-600"
            />
          </div>

          {/* Why Choose Our Service Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Why Choose Our Service?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚗</span>
                </div>
                <h3 className="font-semibold mb-2">Professional Drivers</h3>
                <p className="text-sm text-gray-600">Licensed, background-checked drivers</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="font-semibold mb-2">On-Time Guarantee</h3>
                <p className="text-sm text-gray-600">We never cancel and always arrive on time</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-sm text-gray-600">No hidden fees, competitive rates</p>
              </div>
            </div>
          </div>
          
          {/* Booking Form */}
          <BookingForm />
        </div>
      </PageContent>
    </PageContainer>
  );
}
