import { StandardLayout } from '@/components/layout/StandardLayout';

export default function PrivacyPage() {
  return (
    <StandardLayout 
      title="Privacy Policy"
      subtitle="How we protect your data"
    >

      <div className="legal-content">
        <section className="legal-section">
          <h2>Privacy Policy</h2>
          <p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
          
          <div className="legal-content">
            <h3>1. Information We Collect</h3>
            <p>We collect information you provide when booking, including name, contact details, pickup/dropoff locations, and payment information.</p>
            
            <h3>2. How We Use Your Information</h3>
            <p>We use your information to process bookings, communicate about your ride, provide customer support, and improve our services.</p>
            
            <h3>3. Information Sharing</h3>
            <p>We do not sell your personal information. We may share information with drivers and service providers necessary to fulfill your booking.</p>
            
            <h3>4. Data Security</h3>
            <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
            
            <h3>5. Your Rights</h3>
            <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
          </div>
        </section>
      </div>
  
    </StandardLayout>
  );
}
