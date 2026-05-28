export const env = {
  API_URL: import.meta.env.VITE_API_URL,
  API_URL_PREFIX: import.meta.env.VITE_API_URL_PREFIX ?? 'api',
  APP_MODE: import.meta.env.VITE_APP_MODE ?? 'development',
};
export const isProductionMode = env.APP_MODE === 'production';
