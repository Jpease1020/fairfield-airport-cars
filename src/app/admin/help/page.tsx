'use client';

const AdminHelpPage = () => {
  const helpSections = [
    {
      title: "Managing Bookings",
      icon: "📖",
      items: [
        {
          question: "How do I view all upcoming rides?",
          answer: "Go to Admin → Bookings to see all current and upcoming bookings. You can filter by status (pending, confirmed, completed, cancelled)."
        },
        {
          question: "How do I update a booking status?",
          answer: "In the Bookings page, click on any booking to view details. Use the status dropdown to change from 'pending' to 'confirmed', 'completed', or 'cancelled'."
        },
        {
          question: "What happens when I confirm a booking?",
          answer: "The customer receives an SMS and email confirmation with ride details and a calendar invite. The booking status changes to 'confirmed'."
        },
        {
          question: "How do I handle cancellations?",
          answer: "Customers can cancel through their booking link, or you can cancel manually in the admin. Refunds are processed automatically based on your cancellation policy."
        }
      ]
    },
    {
      title: "Content Management (CMS)",
      icon: "⚙️",
      items: [
        {
          question: "How do I update my business information?",
          answer: "Go to Admin → CMS → Business Settings to edit your company name, phone, email, address, and hours."
        },
        {
          question: "Can I change the homepage content?",
          answer: "Yes! Go to Admin → CMS → Pages → Homepage to edit the hero section, features, and contact information."
        },
        {
          question: "How do I update pricing?",
          answer: "Go to Admin → CMS → Pricing to set your base fare, per-mile rate, and cancellation policies."
        },
        {
          question: "Can I edit email and SMS templates?",
          answer: "Yes! Go to Admin → CMS → Communication to customize all email and SMS messages sent to customers."
        }
      ]
    },
    {
      title: "Customer Communication",
      icon: "📧",
      items: [
        {
          question: "What emails do customers receive?",
          answer: "Booking confirmations (with calendar invite), 24-hour reminders, cancellation confirmations, and feedback requests after completed rides."
        },
        {
          question: "What SMS messages are sent?",
          answer: "Booking confirmations, 24-hour reminders, 'on my way' notifications, and feedback requests."
        },
        {
          question: "How do I send a custom message to a customer?",
          answer: "In the Bookings page, click on a booking and use the 'Send Message' feature to send a custom SMS."
        },
        {
          question: "Can I customize the message templates?",
          answer: "Yes! Go to Admin → CMS → Communication to edit all email and SMS templates with your own wording."
        }
      ]
    },
    {
      title: "Payments & Billing",
      icon: "💳",
      items: [
        {
          question: "How do payments work?",
          answer: "Customers pay a 50% deposit when booking. The remaining balance is collected after the ride. All payments are processed through Square."
        },
        {
          question: "How do I handle refunds?",
          answer: "Refunds are processed automatically based on your cancellation policy. Full refunds for >24h cancellations, 50% for 3-24h, no refund for <3h."
        },
        {
          question: "Can customers tip?",
          answer: "Yes! The Square checkout includes tipping options. Tips are automatically added to your earnings."
        },
        {
          question: "How do I view payment history?",
          answer: "Check your Square dashboard for detailed payment history and reports."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: "❓",
      items: [
        {
          question: "What if the booking form isn't working?",
          answer: "Check that your Google Maps API key is configured in the environment variables. Contact your developer if issues persist."
        },
        {
          question: "How do I reset my admin password?",
          answer: "Contact your developer to reset your Firebase authentication credentials."
        },
        {
          question: "What if SMS/email isn't sending?",
          answer: "Check that Twilio and email credentials are configured in environment variables. Contact your developer for setup assistance."
        },
        {
          question: "How do I backup my data?",
          answer: "All data is stored in Firebase Firestore and automatically backed up. Contact your developer for data export if needed."
        }
      ]
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Admin Help & Guide</h1>
        <p className="page-subtitle">Everything you need to know about managing your car service business</p>
      </div>

      <div className="standard-content">
        <div className="grid grid-1 gap-lg">
          {helpSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <span className="card-icon">{section.icon}</span>
                  {section.title}
                </h2>
              </div>
              <div className="card-body">
                <div className="help-items">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="help-item">
                      <h4 className="help-question">{item.question}</h4>
                      <p className="help-answer">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="card-icon">📞</span>
                Need More Help?
              </h2>
            </div>
            <div className="card-body">
              <p className="card-description">
                If you can't find the answer you're looking for, here are additional resources:
              </p>
              <div className="help-resources">
                <div className="help-resource">
                  <span className="help-resource-icon">💬</span>
                  <span>Contact your developer for technical support</span>
                </div>
                <div className="help-resource">
                  <span className="help-resource-icon">📄</span>
                  <span>Check the business documentation in your project files</span>
                </div>
                <div className="help-resource">
                  <span className="help-resource-icon">⚙️</span>
                  <span>Review your CMS settings for configuration options</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHelpPage; 