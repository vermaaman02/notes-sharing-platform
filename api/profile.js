const { app } = require('@azure/functions');
const { connectToDatabase, User } = require('./shared/db');
const { authenticateToken } = require('./shared/auth');

app.http('profile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/profile',
  handler: async (request, context) => {
    try {
      const authResult = authenticateToken(request);
      if (authResult.error) {
        return {
          status: authResult.status,
          jsonBody: { message: authResult.error }
        };
      }

      await connectToDatabase();
      
      const user = await User.findById(authResult.user.userId).select('-password');
      if (!user) {
        return {
          status: 404,
          jsonBody: { message: 'User not found' }
        };
      }
      
      return {
        status: 200,
        jsonBody: user
      };
    } catch (error) {
      context.log('Profile error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
