function resolveServerFlag(baseName: string): boolean {
  const env = process.env.VERCEL_ENV;

  if (env === 'production') {
    return process.env[`${baseName}_PROD_ENABLED`] === 'true';
  }

  if (env === 'preview') {
    return process.env[`${baseName}_PREVIEW_ENABLED`] === 'true';
  }

  return process.env[`${baseName}_ENABLED`] === 'true';
}

export function isSmsInboxEnabled(): boolean {
  return resolveServerFlag('SMS_INBOX');
}
