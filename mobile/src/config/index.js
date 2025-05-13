
// mobile/src/config/index.js
// Configuration settings for the app

const ENV = {
    dev: {
      API_URL: 'http://localhost:3000', // For use with emulator/simulator
      SOCKET_URL: 'http://localhost:3000',
      ENV_NAME: 'development'
    },
    staging: {
      API_URL: 'https://notes-sync-api-staging.example.com',
      SOCKET_URL: 'https://notes-sync-api-staging.example.com',
      ENV_NAME: 'staging'
    },
    prod: {
      API_URL: 'https://notes-sync-api.example.com',
      SOCKET_URL: 'https://notes-sync-api.example.com',
      ENV_NAME: 'production'
    }
  };
  
  // You'll need to modify this for Android emulator
  // Android emulator can't access localhost directly, use:
  // API_URL: 'http://10.0.2.2:3000'
  
  const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
    if (env === 'production') {
      return ENV.prod;
    } else if (env === 'staging') {
      return ENV.staging;
    } else {
      return ENV.dev;
    }
  };
  
  export default getEnvVars();