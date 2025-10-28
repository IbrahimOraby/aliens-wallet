// API Configuration
// In production (Netlify), use relative path to leverage proxy
// In development, use full URL from environment variable
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' // Use Netlify proxy in production
  : (import.meta.env.VITE_API_BASE_URL || 'http://46.101.174.239:8082/api'); // Use env var or fallback in dev

// Runtime check for development
if (!import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('⚠️ VITE_API_BASE_URL not set. Using fallback API URL for development.');
}

export { API_BASE_URL };

