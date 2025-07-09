const { app } = require('@azure/functions');

app.http('index', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: '',
  handler: async (request, context) => {
    return {
      status: 200,
      jsonBody: { 
        message: 'Notes Sharing Platform API is running!',
        version: '1.0.0',
        endpoints: [
          '/api/auth/register',
          '/api/auth/login', 
          '/api/auth/validate',
          '/api/auth/profile',
          '/api/notes',
          '/api/notes/upload',
          '/api/notes/my-notes',
          '/api/notes/{id}/download',
          '/api/subjects'
        ]
      }
    };
  }
});
