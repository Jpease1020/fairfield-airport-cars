import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test basic component imports
describe('Basic Component Tests', () => {
  it('should render basic UI components without errors', async () => {
    // Test that we can import and render basic components
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

  it('should render page components without errors', async () => {
    // Test that we can import page components
    const { default: CostsPage } = await import('@/app/costs/page');
    
    render(<CostsPage />);
    
    expect(screen.getByText('Costs')).toBeInTheDocument();
  });

  it('should render admin components without errors', async () => {
    // Test that we can import admin components
    const { default: AdminDashboard } = await import('@/app/admin/page');
    
    render(<AdminDashboard />);
    
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });
}); 