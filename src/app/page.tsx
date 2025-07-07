import Link from 'next/link';
import { Car, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-20 bg-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Your Private Airport Car Service
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area.
          </p>
          <Link href="/book">
            <Button className="mt-8" size="lg">
              Book Your Ride Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <Star className="h-12 w-12 text-indigo-600" />
              <h3 className="mt-4 text-xl font-bold">5-Star Service</h3>
              <p className="mt-2 text-gray-600">
                Experience the highest level of professionalism and customer care.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Car className="h-12 w-12 text-indigo-600" />
              <h3 className="mt-4 text-xl font-bold">Luxury Vehicles</h3>
              <p className="mt-2 text-gray-600">
                Travel in comfort and style in a modern, spacious black SUV.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-indigo-600" />
              <h3 className="mt-4 text-xl font-bold">Always On Time</h3>
              <p className="mt-2 text-gray-600">
                We pride ourselves on punctuality, ensuring you're never late.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Our Fleet</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            You will ride in a meticulously maintained Chevrolet Suburban or a similar full-size luxury SUV, offering ample space for passengers and luggage.
          </p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready for a Stress-Free Ride?</h2>
          <Link href="/book">
            <Button className="mt-8" size="lg">
              Book Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}