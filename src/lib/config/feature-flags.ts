// Feature flags configuration
export const FEATURE_FLAGS = {
  AI_ASSISTANT_ENABLED: process.env.AI_ASSISTANT_ENABLED === 'true',
  ADVANCED_ANALYTICS_ENABLED: process.env.ADVANCED_ANALYTICS_ENABLED === 'true',
  FLIGHT_STATUS_INTEGRATION: process.env.FLIGHT_STATUS_INTEGRATION === 'true',
} as const;

// Type for feature flag keys
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

// Helper function to get all enabled features
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => key);
}


