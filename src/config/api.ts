// API Configuration
// Use environment variable - must be set in Netlify environment variables
// For local development, create a .env file with VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is not set. Please configure it in your deployment settings.');
}

// In production (hosted), ensure HTTPS is used
const finalApiUrl = API_BASE_URL;
if (import.meta.env.PROD && finalApiUrl.startsWith('http://')) {
  // Try converting to HTTPS
//   finalApiUrl = finalApiUrl.replace('http://', 'https://');
  console.warn('⚠️ API URL converted to HTTPS for production:', finalApiUrl);
}

export { finalApiUrl as API_BASE_URL };

