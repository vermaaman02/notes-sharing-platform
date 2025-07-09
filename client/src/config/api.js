const config = {
  development: {
    API_BASE_URL: 'http://localhost:5001/api'
  },
  production: {
    API_BASE_URL: '/api'
  }
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment];
