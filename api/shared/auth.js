const jwt = require('jsonwebtoken');

// Auth middleware for Azure Functions
function authenticateToken(request) {
  const authHeader = request.headers.get('authorization');
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

module.exports = {
  authenticateToken
};
