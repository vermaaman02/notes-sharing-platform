const { app } = require('@azure/functions');
const { connectToDatabase, User } = require('./shared/db');
const { authenticateToken } = require('./shared/auth');

app.http('validate', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/validate',
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
        jsonBody: { 
          valid: true, 
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            university: user.university
          }
        }
      };
    } catch (error) {
      context.log('Token validation error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
