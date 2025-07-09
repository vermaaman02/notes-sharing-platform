const jwt = require('jsonwebtoken');

// Auth middleware for Netlify Functions
function authenticateToken(event) {
  const authHeader = event.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Access token required', status: 401 };
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return { user };
  } catch (err) {
    return { error: 'Invalid token', status: 403 };
  }
}

// CORS headers for Netlify Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

module.exports = {
  authenticateToken,
  corsHeaders
};
