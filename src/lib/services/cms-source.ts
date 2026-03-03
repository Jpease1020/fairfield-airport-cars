import staticCmsDataRaw from '@/content/static-cms.generated.json';

export type CmsSource = 'firestore' | 'static';

const sanitizeFirebaseLikeData = (value: unknown): unknown => {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFirebaseLikeData(item));
  }

  if (typeof value === 'object') {
    const maybeTimestamp = value as { _seconds?: unknown; _nanoseconds?: unknown };
    if (typeof maybeTimestamp._seconds === 'number' && typeof maybeTimestamp._nanoseconds === 'number') {
      return new Date(maybeTimestamp._seconds * 1000).toISOString();
    }

    const sanitizedObject: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      sanitizedObject[key] = sanitizeFirebaseLikeData(nestedValue);
    }
    return sanitizedObject;
  }

  return value;
};

const staticCmsData = sanitizeFirebaseLikeData(staticCmsDataRaw) as Record<string, any>;

export const getConfiguredCmsSource = (): CmsSource => {
  const source = (process.env.CMS_SOURCE || 'static').toLowerCase();
  const requestedSource: CmsSource = source === 'firestore' ? 'firestore' : 'static';

  // Production safety rail: static copy is default and Firestore is opt-in.
  if (
    requestedSource === 'firestore' &&
    process.env.NODE_ENV === 'production' &&
    process.env.CMS_ALLOW_FIRESTORE_IN_PROD !== 'true'
  ) {
    return 'static';
  }

  return requestedSource;
};

export const isStaticCmsSource = (): boolean => getConfiguredCmsSource() === 'static';

export const getStaticCmsData = (): Record<string, any> => staticCmsData;

export const getStaticCmsPage = (pageType: string): any | null => {
  if (!pageType) return null;
  return staticCmsData[pageType] ?? null;
};
