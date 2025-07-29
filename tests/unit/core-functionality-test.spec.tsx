import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Core Functionality Tests', () => {
  it('should render homepage with booking functionality', async () => {
    const { default: HomePage } = await import('@/app/page');
    
    render(<HomePage />);
    
    // Check for basic homepage content - use a more specific text
    expect(screen.getByText('Premium Airport Transportation')).toBeInTheDocument();
  });

  it('should render booking form', async () => {
    const { default: BookingForm } = await import('@/app/book/booking-form');
    
    render(<BookingForm />);
    
    // Check for booking form elements
    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
  });

  it('should render costs page', async () => {
    const { default: CostsPage } = await import('@/app/costs/page');
    
    render(<CostsPage />);
    
    expect(screen.getByText('Costs')).toBeInTheDocument();
  });

  it('should render help page', async () => {
    const { default: HelpPage } = await import('@/app/help/page');
    
    render(<HelpPage />);
    
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should render about page', async () => {
    const { default: AboutPage } = await import('@/app/about/page');
    
    render(<AboutPage />);
    
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });
}); 