const { app } = require('@azure/functions');
const { connectToDatabase, Note } = require('./shared/db');

app.http('getNotes', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'notes',
  handler: async (request, context) => {
    try {
      await connectToDatabase();
      
      const url = new URL(request.url);
      const subject = url.searchParams.get('subject');
      const search = url.searchParams.get('search');
      
      let query = {};

      if (subject) {
        query.subject = subject;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } }
        ];
      }

      const notes = await Note.find(query)
        .populate('uploaderId', 'firstName lastName university')
        .sort({ createdAt: -1 });

      return {
        status: 200,
        jsonBody: notes
      };
    } catch (error) {
      context.log('Get notes error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
