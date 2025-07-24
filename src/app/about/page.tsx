"use client";

import { useEditMode } from '@/components/admin/EditModeProvider';
import { EditableTitle, EditableContent } from '@/components/admin/EditableField';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';

export default function AboutPage() {
  const { handleFieldChange } = useEditMode();

  return (
    <PageContainer>
      <PageHeader title="About Us">
        <EditableTitle
          value="About Fairfield Airport Car Service"
          onChange={(value) => handleFieldChange('about', 'title', value)}
          className="text-3xl font-bold text-gray-900"
        />
      </PageHeader>
      <PageContent>
        <div className="max-w-4xl mx-auto">
          <EditableContent
            value={`
              <h2 className="text-2xl font-semibold mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6">
                Fairfield Airport Car Service has been providing reliable, comfortable, and professional 
                transportation services to and from Fairfield Airport for over a decade. We understand 
                that travel can be stressful, which is why we've made it our mission to provide a 
                seamless and enjoyable experience for every passenger.
              </p>
              
              <h2 className="text-2xl font-semibold mb-6">Our Commitment</h2>
              <p className="text-lg text-gray-700 mb-6">
                We are committed to providing the highest level of service with:
              </p>
              <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-2">
                <li>Professional, licensed drivers</li>
                <li>Well-maintained, comfortable vehicles</li>
                <li>Punctual pickups and drop-offs</li>
                <li>Competitive, transparent pricing</li>
                <li>24/7 customer support</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-6">Why Choose Us</h2>
              <p className="text-lg text-gray-700 mb-6">
                When you choose Fairfield Airport Car Service, you're choosing:
              </p>
              <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-2">
                <li><strong>Reliability:</strong> We never cancel bookings and always arrive on time</li>
                <li><strong>Safety:</strong> All our drivers are background-checked and vehicles are regularly inspected</li>
                <li><strong>Comfort:</strong> Clean, spacious vehicles with climate control</li>
                <li><strong>Convenience:</strong> Easy online booking and real-time tracking</li>
                <li><strong>Value:</strong> Competitive rates with no hidden fees</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-6">Our Fleet</h2>
              <p className="text-lg text-gray-700 mb-6">
                Our modern fleet includes:
              </p>
              <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-2">
                <li>Luxury sedans for individual travelers</li>
                <li>SUVs for families and groups</li>
                <li>Vans for larger parties</li>
                <li>Accessible vehicles for passengers with special needs</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-6">Service Areas</h2>
              <p className="text-lg text-gray-700 mb-6">
                We serve the greater Fairfield area and surrounding communities, providing reliable 
                transportation to and from:
              </p>
              <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-2">
                <li>Fairfield Airport</li>
                <li>Local hotels and accommodations</li>
                <li>Business districts</li>
                <li>Residential areas</li>
                <li>Popular tourist destinations</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
              <p className="text-lg text-gray-700 mb-6">
                Ready to experience the difference? Contact us today to book your ride or learn more 
                about our services. We're here to make your journey as smooth and enjoyable as possible.
              </p>
            `}
            onChange={(value) => handleFieldChange('about', 'content', value)}
            className="prose prose-lg max-w-none"
          />
        </div>
      </PageContent>
    </PageContainer>
  );
} 