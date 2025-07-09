const { connectToDatabase, User } = require('./shared/db');
const { authenticateToken, corsHeaders } = require('./shared/auth');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const authResult = authenticateToken(event);
    if (authResult.error) {
      return {
        statusCode: authResult.status,
        headers: corsHeaders,
        body: JSON.stringify({ message: authResult.error })
      };
    }

    await connectToDatabase();
    
    const user = await User.findById(authResult.user.userId).select('-password');
    if (!user) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        valid: true, 
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          university: user.university
        }
      })
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Server error' })
    };
  }
};
