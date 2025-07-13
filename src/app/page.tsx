'use client';

import Link from 'next/link';
import { Car, Clock, Star, MapPin, Shield, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { HeroSection, FeatureCard, FAQ, ContactSection } from '@/components/marketing';

export default function HomePage() {
  const features = [
    {
      title: '5-Star Service',
      description: 'Experience the highest level of professionalism and customer care.',
      icon: <Star className="h-6 w-6" />,
    },
    {
      title: 'Luxury Vehicles',
      description: 'Travel in comfort and style in a modern, spacious black SUV.',
      icon: <Car className="h-6 w-6" />,
    },
    {
      title: 'Always On Time',
      description: 'We pride ourselves on punctuality, ensuring you\'re never late.',
      icon: <Clock className="h-6 w-6" />,
    },
    {
      title: 'Wide Coverage',
      description: 'Service to all major airports in NY and CT area.',
      icon: <MapPin className="h-6 w-6" />,
    },
    {
      title: 'Safe & Secure',
      description: 'Fully insured and licensed transportation service.',
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: 'Professional Drivers',
      description: 'Experienced, courteous, and background-checked drivers.',
      icon: <Users className="h-6 w-6" />,
    },
  ];

  const faqItems = [
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

  const contactMethods = [
    {
      type: 'phone' as const,
      label: 'Call Us',
      value: '+1 (203) 555-0123',
      href: 'tel:+1-203-555-0123',
    },
    {
      type: 'text' as const,
      label: 'Text Us',
      value: '+1 (203) 555-0123',
      href: 'sms:+1-203-555-0123',
    },
    {
      type: 'email' as const,
      label: 'Email Us',
      value: 'info@fairfieldairportcars.com',
      href: 'mailto:info@fairfieldairportcars.com',
    },
  ];

  return (
    <PageContainer>
      <HeroSection
        title="Your Private Airport Car Service"
        subtitle="Premium Transportation"
        description="Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area."
        primaryAction={{
          label: 'Book Your Ride Now',
          href: '/book',
        }}
        secondaryAction={{
          label: 'Learn More',
          href: '/help',
        }}
        variant="centered"
      />

      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our premium airport car service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                variant="default"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Fleet</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You will ride in a meticulously maintained Chevrolet Suburban or a similar full-size luxury SUV, offering ample space for passengers and luggage.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              title="Luxury SUV"
              description="Spacious Chevrolet Suburban with premium amenities including complimentary water, Wi-Fi, and phone chargers."
              variant="highlighted"
            />
            <FeatureCard
              title="Professional Service"
              description="Experienced drivers with background checks, ensuring your safety and comfort throughout your journey."
              variant="highlighted"
            />
          </div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <FAQ
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about our service"
          items={faqItems}
          variant="accordion"
        />
      </div>

      <div className="py-20 bg-white">
        <ContactSection
          title="Get in Touch"
          subtitle="Ready to Book?"
          description="Contact us for any questions or to make your reservation. We're here to help ensure your journey is smooth and stress-free."
          contactMethods={contactMethods}
          variant="centered"
        />
      </div>

      <div className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for a Stress-Free Ride?</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Book your airport transportation today and experience the difference of premium service.
          </p>
          <Link 
            href="/book"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-indigo-600 bg-white border border-transparent rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Book Now
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}