import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple smoke test to verify basic functionality
describe('Smoke Tests', () => {
  it('can render basic HTML elements', () => {
    render(
      <div>
        <h1>Test Title</h1>
        <p>Test content</p>
        <button>Test Button</button>
      </div>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('can handle form inputs', () => {
    render(
      <form>
        <input type="text" placeholder="Enter name" />
        <input type="email" placeholder="Enter email" />
        <button type="submit">Submit</button>
      </form>
    );

    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('can handle navigation elements', () => {
    render(
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/book">Book</a>
      </nav>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Book')).toBeInTheDocument();
  });

  it('can handle conditional rendering', () => {
    const showContent = true;
    
    render(
      <div>
        {showContent && <p>Visible content</p>}
        {!showContent && <p>Hidden content</p>}
      </div>
    );

    expect(screen.getByText('Visible content')).toBeInTheDocument();
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('can handle dynamic content', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    
    render(
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
}); 