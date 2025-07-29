import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Essential Functionality Tests', () => {
  describe('Core Pages', () => {
    it('should render homepage', async () => {
      const { default: HomePage } = await import('@/app/page');
      render(<HomePage />);
      expect(screen.getByText('Premium Airport Transportation')).toBeInTheDocument();
    });

    it('should render booking form', async () => {
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);
      expect(screen.getByText(/name/i)).toBeInTheDocument();
    });

    it('should render costs page', async () => {
      const { default: CostsPage } = await import('@/app/costs/page');
      render(<CostsPage />);
      expect(screen.getByText('Costs')).toBeInTheDocument();
    });

    it('should render help page', async () => {
      const { default: HelpPage } = await import('@/app/help/page');
      render(<HelpPage />);
      expect(document.body).toBeInTheDocument();
    });

    it('should render about page', async () => {
      const { default: AboutPage } = await import('@/app/about/page');
      render(<AboutPage />);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('UI Components', () => {
    it('should render basic UI components', async () => {
      const { Container, Text, H1 } = await import('@/components/ui');
      
      render(
        <Container>
          <H1>Test Heading</H1>
          <Text>Test content</Text>
        </Container>
      );

      expect(screen.getByText('Test Heading')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  // MSW integration is tested in msw-test.spec.ts
}); 