// src/services/environment.js

/**
 * Determines the application's current running environment.
 * It checks Vercel's system environment variable to distinguish between
 * production, preview, and local development environments.
 */
const getAppEnv = () => {
  const vercelEnv = import.meta.env.VITE_VERCEL_ENV;
  if (vercelEnv === 'production') {
    return 'PROD';
  }
  if (vercelEnv === 'preview') {
    return 'test';
  }
  return 'dev';
};

export const APP_ENV = getAppEnv();

/**
 * Disable console logs in production
 */
export const DISABLE_CONSOLE_IN_PROD = true;

/**
 * Toggle for showing activation conditions (buttons and modal) in NFT view
 */
export const SHOW_ACTIVATION_CONDITIONS = false;

/**
 * Whitelist addresses that can see the full dashboard
 */
export const WHITELIST_ADDRESSES = [
    // Add whitelist addresses here, lowercase recommended but we normalize anyway
    "0xc770f9B051c9f67E5405E597655e9D7732B76d28",
    "0xdd8c7d63fa18faefba74be22e69cfa43c7bbe6d6",
    "0xecfe953e2d07851c48893f035e78991856e71f79"
].map(addr => addr.toLowerCase());

/**
 * The Graph endpoint and token for admin performance dashboard.
 */
export const UMBRELLA_GRAPH_ENDPOINT = 'https://gateway.thegraph.com/api/subgraphs/id/4uyewCHf6UFw2q8mNdhKVALk8jCfHpujp3Q73WTFC8gT';
export const UMBRELLA_GRAPH_BEARER_TOKEN = '59ea243e4cb1078db41167f3fb142843';

/**
 * Dedicated allowlist for admin performance page.
 */
export const ADMIN_PERFORMANCE_ALLOWED_ADDRESSES = [
  '0xecfe953e2d07851c48893f035e78991856e71f79',
  '0xc770f9b051c9f67e5405e597655e9d7732b76d28',
  '0xdd8c7d63fa18faefba74be22e69cfa43c7bbe6d6'
];
