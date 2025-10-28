// API Configuration
// Use environment variable or fallback to the default API URL
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://46.101.174.239:8082/api';

// In production (hosted), try to use HTTPS if HTTP is provided
if (import.meta.env.PROD && API_BASE_URL.startsWith('http://')) {
  // Try converting to HTTPS
  API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
  console.warn('⚠️ API URL converted to HTTPS for production:', API_BASE_URL);
}

export { API_BASE_URL };

