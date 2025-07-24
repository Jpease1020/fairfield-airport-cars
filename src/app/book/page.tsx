import { StandardLayout } from '@/components/layout/StandardLayout';

export default function BookPage() {
  return (
    <StandardLayout 
      title="Book Your Airport Transfer"
      subtitle="Reserve your luxury airport transportation"
    >

      <div className="booking-content">
        <section className="booking-section">
          <h2>Book Your Ride</h2>
          <p>Fill out the form below to book your airport transportation.</p>
          
          <div className="booking-form">
            <div className="form-group">
              <label className="form-label">Pickup Location</label>
              <input type="text" className="form-input" placeholder="Enter pickup address" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Dropoff Location</label>
              <input type="text" className="form-input" placeholder="Enter destination" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Pickup Date</label>
              <input type="date" className="form-input" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Pickup Time</label>
              <input type="time" className="form-input" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Number of Passengers</label>
              <select className="form-input">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea className="form-input form-textarea" placeholder="Any special requirements..."></textarea>
            </div>
            
            <button className="btn btn-primary">Calculate Fare</button>
          </div>
        </section>
      </div>
  
    </StandardLayout>
  );
}
