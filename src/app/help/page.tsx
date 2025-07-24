import { StandardLayout } from '@/components/layout/StandardLayout';

export default function HelpPage() {
  return (
    <StandardLayout 
      title="Help & Support"
      subtitle="We're here to help"
    >

      <div className="help-content">
        <section className="help-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-list">
            <div className="faq-item">
              <h3>How far in advance should I book?</h3>
              <p>We recommend booking at least 24 hours in advance, especially for early morning flights.</p>
            </div>
            
            <div className="faq-item">
              <h3>What if my flight is delayed?</h3>
              <p>We monitor flight status and will adjust pickup times accordingly. No additional charges for reasonable delays.</p>
            </div>
            
            <div className="faq-item">
              <h3>Do you provide child seats?</h3>
              <p>Yes, we can provide child seats upon request. Please let us know when booking.</p>
            </div>
            
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, debit cards, and cash payments.</p>
            </div>
          </div>
        </section>
        
        <section className="help-section">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <div className="contact-item">
              <h3>Phone</h3>
              <p>(203) 555-0123</p>
            </div>
            <div className="contact-item">
              <h3>Email</h3>
              <p>info@fairfieldairportcar.com</p>
            </div>
            <div className="contact-item">
              <h3>Service Hours</h3>
              <p>24/7 Service Available</p>
            </div>
          </div>
        </section>
      </div>
  
    </StandardLayout>
  );
}
