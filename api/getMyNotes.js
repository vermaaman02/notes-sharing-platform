const { app } = require('@azure/functions');
const { connectToDatabase, Note } = require('./shared/db');
const { authenticateToken } = require('./shared/auth');

app.http('getMyNotes', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'notes/my-notes',
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
      
      const notes = await Note.find({ uploaderId: authResult.user.userId })
        .sort({ createdAt: -1 });

      return {
        status: 200,
        jsonBody: notes
      };
    } catch (error) {
      context.log('Get user notes error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
