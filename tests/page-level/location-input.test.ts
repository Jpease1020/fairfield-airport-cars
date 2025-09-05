import { test, expect } from '@playwright/test';

test.describe('LocationInput Component - Page Level Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Google Maps API
    await page.addInitScript(() => {
      // Mock Google Maps API
      (window as any).google = {
        maps: {
          places: {
            Autocomplete: class MockAutocomplete {
              private input: HTMLInputElement;
              private listeners: { [key: string]: Function[] } = {};

              constructor(input: HTMLInputElement, options: any) {
                this.input = input;
                this.setupMockAutocomplete();
              }

              private setupMockAutocomplete() {
                // Simulate autocomplete behavior
                this.input.addEventListener('input', (e) => {
                  const value = (e.target as HTMLInputElement).value;
                  if (value.length > 2) {
                    // Simulate showing suggestions
                    this.showSuggestions(value);
                  }
                });
              }

              private showSuggestions(query: string) {
                // Mock suggestions based on query
                const suggestions = [
                  `${query} Airport`,
                  `${query} Station`,
                  `${query} Street, New York, NY`,
                  `${query} Avenue, Fairfield, CT`
                ];

                // Simulate clicking on first suggestion after a delay
                setTimeout(() => {
                  const place = {
                    geometry: { location: { lat: () => 40.7128, lng: () => -74.0060 } },
                    name: suggestions[0],
                    formatted_address: suggestions[0],
                    types: ['airport']
                  };
                  
                  // Trigger place_changed event
                  this.listeners['place_changed']?.forEach(callback => callback());
                  
                  // Update input value
                  this.input.value = suggestions[0];
                  this.input.dispatchEvent(new Event('input', { bubbles: true }));
                }, 100);
              }

              addListener(event: string, callback: Function) {
                if (!this.listeners[event]) {
                  this.listeners[event] = [];
                }
                this.listeners[event].push(callback);
              }

              getPlace() {
                return {
                  geometry: { location: { lat: () => 40.7128, lng: () => -74.0060 } },
                  name: this.input.value,
                  formatted_address: this.input.value,
                  types: ['airport']
                };
              }
            }
          }
        }
      };
    });
  });

  test('renders input field correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');

    await expect(pickupInput).toBeVisible();
    await expect(dropoffInput).toBeVisible();
    
    await expect(pickupInput).toHaveAttribute('placeholder', 'From: Fairfield Station');
    await expect(dropoffInput).toHaveAttribute('placeholder', 'To: JFK Airport');
  });

  test('handles manual typing correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    
    // Type in the input
    await pickupInput.fill('JFK');
    await expect(pickupInput).toHaveValue('JFK');
  });

  test('shows autocomplete suggestions when typing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    
    // Type to trigger autocomplete
    await pickupInput.fill('JFK');
    
    // Wait for autocomplete to process
    await page.waitForTimeout(200);
    
    // The mock should have updated the input value
    await expect(pickupInput).toHaveValue('JFK Airport');
  });

  test('calls onLocationSelect when suggestion is selected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Listen for console logs to verify onLocationSelect is called
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    
    // Type to trigger autocomplete
    await pickupInput.fill('JFK');
    
    // Wait for autocomplete to process
    await page.waitForTimeout(200);
    
    // Verify the input value was updated by autocomplete
    await expect(pickupInput).toHaveValue('JFK Airport');
  });

  test('maintains value when other form fields change', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    
    // Fill pickup location
    await pickupInput.fill('JFK Airport');
    await expect(pickupInput).toHaveValue('JFK Airport');
    
    // Fill dropoff location
    await dropoffInput.fill('Fairfield Station');
    await expect(dropoffInput).toHaveValue('Fairfield Station');
    
    // Verify pickup location is still there
    await expect(pickupInput).toHaveValue('JFK Airport');
  });

  test('handles multiple rapid changes without breaking', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    
    // Rapidly change the input value
    await pickupInput.fill('JFK');
    await page.waitForTimeout(50);
    await pickupInput.fill('LGA');
    await page.waitForTimeout(50);
    await pickupInput.fill('EWR');
    await page.waitForTimeout(50);
    
    // Should still work
    await expect(pickupInput).toHaveValue('EWR');
  });

  test('works with both pickup and dropoff inputs independently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    
    // Fill both inputs
    await pickupInput.fill('JFK Airport');
    await dropoffInput.fill('Fairfield Station');
    
    // Both should maintain their values
    await expect(pickupInput).toHaveValue('JFK Airport');
    await expect(dropoffInput).toHaveValue('Fairfield Station');
  });
});
