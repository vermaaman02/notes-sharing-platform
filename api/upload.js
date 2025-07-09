const { app } = require('@azure/functions');
const { connectToDatabase, Note } = require('./shared/db');
const { authenticateToken } = require('./shared/auth');

app.http('upload', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'notes/upload',
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
      
      // Parse multipart form data
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('multipart/form-data')) {
        return {
          status: 400,
          jsonBody: { message: 'Content must be multipart/form-data' }
        };
      }

      // For now, we'll handle basic form data
      // In a real implementation, you'd need to parse the multipart data
      const formData = await request.formData();
      
      const title = formData.get('title');
      const description = formData.get('description');
      const subject = formData.get('subject');
      const course = formData.get('course');
      const university = formData.get('university');
      const file = formData.get('file');

      if (!file) {
        return {
          status: 400,
          jsonBody: { message: 'No file uploaded' }
        };
      }

      // Convert file to base64 for storage (simplified approach)
      const buffer = await file.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');
      
      const note = new Note({
        title,
        description,
        subject,
        course,
        university,
        fileName: file.name,
        filePath: `data:${file.type};base64,${base64Data}`, // Store as base64
        fileType: file.type,
        fileSize: file.size,
        uploaderId: authResult.user.userId
      });

      await note.save();

      return {
        status: 201,
        jsonBody: {
          message: 'Note uploaded successfully',
          note
        }
      };
    } catch (error) {
      context.log('Upload error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
