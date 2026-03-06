'use client';

function resolveClientFlag(baseName: string): boolean {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;

  if (env === 'production') {
    return process.env[`NEXT_PUBLIC_${baseName}_PROD_ENABLED`] === 'true';
  }

  if (env === 'preview') {
    return process.env[`NEXT_PUBLIC_${baseName}_PREVIEW_ENABLED`] === 'true';
  }

  return process.env[`NEXT_PUBLIC_${baseName}_ENABLED`] === 'true';
}

export function isSmsInboxClientEnabled(): boolean {
  return resolveClientFlag('SMS_INBOX');
}
