// Environment configuration for Square and other services
export interface SquareCredentials {
  accessToken: string;
  locationId: string;
  applicationId: string;
  environment: 'sandbox' | 'production';
}

export interface ConfigValidation {
  isValid: boolean;
  errors: string[];
}

// Get Square credentials based on environment
export const getSquareCredentials = (): SquareCredentials => {
  return {
    accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
    locationId: process.env.SQUARE_LOCATION_ID || '',
    applicationId: process.env.SQUARE_APPLICATION_ID || '',
    environment: process.env.NODE_ENV === 'development' ? 'sandbox' : 'production'
  };
};

// Validate Square configuration
export const validateSquareConfig = (): ConfigValidation => {
  const credentials = getSquareCredentials();
  const errors: string[] = [];

  if (!credentials.accessToken) {
    errors.push('Square access token is missing');
  }
  if (!credentials.locationId) {
    errors.push('Square location ID is missing');
  }
  if (!credentials.applicationId) {
    errors.push('Square application ID is missing');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get base URL for the application
export const getBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://fairfieldairportcars.com';
};
