const { app } = require('@azure/functions');
const { connectToDatabase, Note } = require('./shared/db');

app.http('getSubjects', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'subjects',
  handler: async (request, context) => {
    try {
      await connectToDatabase();
      
      const subjects = await Note.distinct('subject');
      
      return {
        status: 200,
        jsonBody: subjects
      };
    } catch (error) {
      context.log('Get subjects error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
