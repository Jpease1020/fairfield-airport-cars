import React from 'react';

export const StandardFooter: React.FC = () => {
  return (
    <footer className="standard-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Fairfield Airport Cars</h3>
          <p>Premium airport transportation service</p>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Phone: (203) 555-0123</p>
          <p>Email: info@fairfieldairportcar.com</p>
        </div>
        
        <div className="footer-section">
          <h4>Service Areas</h4>
          <p>Fairfield County, CT</p>
          <p>New York Airports</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Fairfield Airport Cars. All rights reserved.</p>
      </div>
    </footer>
  );
}; 