import { StandardLayout } from '@/components/layout/StandardLayout';

export default function PortalPage() {
  return (
    <StandardLayout 
      title="Customer Portal"
      subtitle="Manage your bookings"
    >

      <div className="portal-content">
        <section className="portal-section">
          <h2>Welcome to Your Portal</h2>
          <p>Manage your bookings and account information here.</p>
          
          <div className="portal-grid">
            <div className="portal-card">
              <h3>Current Bookings</h3>
              <p>View and manage your upcoming rides</p>
              <a href="#" className="btn btn-primary">View Bookings</a>
            </div>
            
            <div className="portal-card">
              <h3>Past Trips</h3>
              <p>Review your previous rides and receipts</p>
              <a href="#" className="btn btn-outline">View History</a>
            </div>
            
            <div className="portal-card">
              <h3>Account Settings</h3>
              <p>Update your contact information and preferences</p>
              <a href="#" className="btn btn-outline">Settings</a>
            </div>
            
            <div className="portal-card">
              <h3>Support</h3>
              <p>Get help with your bookings</p>
              <a href="/help" className="btn btn-outline">Get Help</a>
            </div>
          </div>
        </section>
      </div>
  
    </StandardLayout>
  );
}
