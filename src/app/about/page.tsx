"use client";

import { StandardLayout } from '@/components/layout/StandardLayout';

export default function AboutPage() {
  return (
    <StandardLayout 
      title="About Us"
      subtitle="Your trusted transportation partner"
    >
      <div className="about-content">
        {/* Our Story Section */}
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Fairfield Airport Car Service has been providing reliable, comfortable, and professional 
            transportation services to and from Fairfield Airport for over a decade. We understand 
            that travel can be stressful, which is why we've made it our mission to provide a 
            seamless and enjoyable experience for every passenger.
          </p>
        </section>

        {/* Our Commitment Section */}
        <section className="about-section">
          <h2>Our Commitment</h2>
          <p>
            We are committed to providing the highest level of service to our customers. From the 
            moment you book with us until you reach your destination, we ensure that every detail 
            is taken care of. Our drivers are professional, courteous, and knowledgeable about the 
            local area and traffic patterns.
          </p>
        </section>

        {/* Our Fleet Section */}
        <section className="about-section">
          <h2>Our Fleet</h2>
          <p>
            We maintain a fleet of modern, well-equipped vehicles to meet your transportation needs. 
            Whether you're traveling alone or with a group, we have the perfect vehicle for you.
          </p>
          <div className="grid grid-2">
            <div className="fleet-info">
              <h3>Sedan</h3>
              <ul>
                <li>Comfortable seating for up to 3 passengers</li>
                <li>Ample trunk space for luggage</li>
                <li>Perfect for business or personal travel</li>
              </ul>
            </div>
            <div className="fleet-info">
              <h3>SUV</h3>
              <ul>
                <li>Spacious seating for up to 6 passengers</li>
                <li>Large cargo area for multiple bags</li>
                <li>Ideal for families or groups</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Service Areas Section */}
        <section className="about-section">
          <h2>Service Areas</h2>
          <p>
            We provide service to and from all major airports in the New York and Connecticut area, 
            including but not limited to:
          </p>
          <div className="service-areas">
            <div className="area-item">
              <h3>New York Airports</h3>
              <ul>
                <li>John F. Kennedy International Airport (JFK)</li>
                <li>LaGuardia Airport (LGA)</li>
                <li>Newark Liberty International Airport (EWR)</li>
              </ul>
            </div>
            <div className="area-item">
              <h3>Connecticut Airports</h3>
              <ul>
                <li>Westchester County Airport (HPN)</li>
                <li>Bradley International Airport (BDL)</li>
                <li>Tweed New Haven Airport (HVN)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="about-section">
          <h2>Get in Touch</h2>
          <p>
            Ready to experience the difference? Contact us today to book your ride or learn more 
            about our services.
          </p>
          <div className="contact-details">
            <div className="contact-detail">
              <h3>Phone</h3>
              <p>(203) 555-0123</p>
            </div>
            <div className="contact-detail">
              <h3>Email</h3>
              <p>info@fairfieldairportcar.com</p>
            </div>
            <div className="contact-detail">
              <h3>Service Hours</h3>
              <p>24/7 Service Available</p>
            </div>
          </div>
        </section>
      </div>
    </StandardLayout>
  );
} 