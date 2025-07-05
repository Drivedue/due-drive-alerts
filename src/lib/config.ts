
// Secure configuration management
export const config = {
  // Paystack public key - this is safe to expose in frontend as it's a public key
  paystack: {
    publicKey: "pk_test_4f5c4b2e8b6f2d1a3e9c0b5a2d8e1f4c3b6a9d2e",
  },
  
  // App configuration
  app: {
    name: "My Garage",
    version: "1.0.0",
    maxSearchLength: 50,
    maxUploadSize: 10 * 1024 * 1024, // 10MB
  }
};

// Input sanitization utilities
export const sanitizeInput = {
  general: (input: string): string => {
    return input.replace(/[<>'"&]/g, '').trim();
  },
  
  search: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9\s\-_.]/g, '').trim();
  },
  
  licensePlate: (input: string): string => {
    return input.replace(/[^A-Za-z0-9\-\s]/g, '').trim().toUpperCase();
  },
  
  vehicleInfo: (input: string): string => {
    return input.replace(/[^A-Za-z0-9\s\-\.]/g, '').trim();
  }
};

// Validation utilities
export const validate = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(phone);
  },
  
  licensePlate: (plate: string): boolean => {
    return /^[A-Za-z0-9\-\s]{1,20}$/.test(plate) && plate.trim().length > 0;
  },
  
  year: (year: number | string): boolean => {
    const yearNum = typeof year === 'string' ? parseInt(year) : year;
    const currentYear = new Date().getFullYear();
    return yearNum >= 1900 && yearNum <= currentYear + 1;
  },
  
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};
