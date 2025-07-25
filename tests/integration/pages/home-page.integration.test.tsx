import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../../../src/app/page';

describe('Home Page Integration', () => {
  it('renders Premium Airport Transportation headers', () => {
    const { container } = render(<HomePage />);
    const headers = screen.getAllByText('Premium Airport Transportation');
    // Should appear twice - once in StandardLayout header, once in hero section
    expect(headers.length).toBe(2);
  });

  it('renders the hero subtitle', () => {
    render(<HomePage />);
    expect(screen.getByText(/Reliable, professional, and luxurious transportation/i)).toBeInTheDocument();
  });

  it('renders the Why Choose Us section', () => {
    render(<HomePage />);
    expect(screen.getByText('Why Choose Us?')).toBeInTheDocument();
    expect(screen.getByText(/Professional service, reliable transportation/i)).toBeInTheDocument();
  });

  it('has a Book Your Ride button', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /Book Your Ride/i })).toBeInTheDocument();
  });

  it('is accessible (no duplicate main landmarks)', () => {
    render(<HomePage />);
    const mainLandmarks = document.querySelectorAll('main');
    expect(mainLandmarks.length).toBeLessThanOrEqual(1);
  });
}); 