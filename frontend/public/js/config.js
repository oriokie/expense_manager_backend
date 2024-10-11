const config = {
  development: {
    BACK_API_URL: 'http://localhost:8080',
  },
  production: {
    BACK_API_URL: 'https://api.oriokie.tech',
  },
};

// Determine the current environment
const env = process.env.NODE_ENV || 'development'; // Default to 'development'
export const API_URL = config[env].BACK_API_URL;
