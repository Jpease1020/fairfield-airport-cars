/**
 * Utility functions for validation
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned) && cleaned.length >= 10;
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
};

export const isValidDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isFutureDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValidDate(dateObj) && dateObj > new Date();
};

export const isPastDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValidDate(dateObj) && dateObj < new Date();
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0 && cleaned.length >= 13 && cleaned.length <= 19;
};

export const isValidPostalCode = (postalCode: string, country = 'US'): boolean => {
  const cleaned = postalCode.replace(/\s/g, '');
  
  switch (country) {
    case 'US':
      return /^\d{5}(-\d{4})?$/.test(cleaned);
    case 'CA':
      return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(cleaned);
    default:
      return cleaned.length >= 3;
  }
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidBookingTime = (dateTime: string | Date, minHoursAhead = 2): boolean => {
  const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  const now = new Date();
  const minTime = new Date(now.getTime() + minHoursAhead * 60 * 60 * 1000);
  
  return isValidDate(dateObj) && dateObj >= minTime;
};

export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

export const isValidFare = (fare: number): boolean => {
  return typeof fare === 'number' && fare > 0 && fare < 10000 && !isNaN(fare);
};

export const isValidTipAmount = (tip: number, fare: number): boolean => {
  return (
    typeof tip === 'number' &&
    tip >= 0 &&
    tip <= fare * 2 && // Max 200% tip
    !isNaN(tip)
  );
};
