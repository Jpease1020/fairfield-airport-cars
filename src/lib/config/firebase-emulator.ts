// Firebase Emulator Configuration
// This file configures Firebase to use local emulators during development

export const EMULATOR_CONFIG = {
  // Enable emulators in development mode
  enabled: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true',
  
  // Emulator ports (must match firebase.json)
  ports: {
    auth: 9099,
    functions: 5001,
    firestore: 8080,
    storage: 9199,
    ui: 4000
  },
  
  // Emulator URLs
  urls: {
    auth: `http://localhost:9099`,
    functions: `http://localhost:5001`,
    firestore: `localhost:8080`,
    storage: `http://localhost:9199`,
    ui: `http://localhost:4000`
  }
};

export const getEmulatorConfig = () => {
  if (!EMULATOR_CONFIG.enabled) {
    return {};
  }

  return {
    auth: {
      url: EMULATOR_CONFIG.urls.auth
    },
    functions: {
      url: EMULATOR_CONFIG.urls.functions
    },
    firestore: {
      host: EMULATOR_CONFIG.urls.firestore,
      ssl: false
    },
    storage: {
      url: EMULATOR_CONFIG.urls.storage
    }
  };
};
