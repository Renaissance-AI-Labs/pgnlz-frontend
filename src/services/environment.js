// src/services/environment.js

/**
 * Determines the application's current running environment.
 * It checks Vercel's system environment variable to distinguish between
 * production, preview, and local development environments.
 * Also falls back to standard Vite environment variables.
 */
const getAppEnv = () => {
  // 1. Check Vercel specific env (if deployed on Vercel)
  const vercelEnv = import.meta.env.VITE_VERCEL_ENV;
  if (vercelEnv === 'production') {
    return 'PROD';
  }
  if (vercelEnv === 'preview') {
    return 'test';
  }

  // 2. Check standard Vite mode
  // When running "npm run build", import.meta.env.MODE is 'production' by default
  if (import.meta.env.MODE === 'production') {
    return 'PROD';
  }

  return 'dev';
};

export const APP_ENV = getAppEnv();

/**
 * Disable console logs in production
 */
export const DISABLE_CONSOLE_IN_PROD = true;
