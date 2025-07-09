const { app } = require('@azure/functions');
const { connectToDatabase, Note } = require('./shared/db');

app.http('downloadNote', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'notes/{id}/download',
  handler: async (request, context) => {
    try {
      await connectToDatabase();
      
      const noteId = request.params.id;
      const note = await Note.findById(noteId);
      
      if (!note) {
        return {
          status: 404,
          jsonBody: { message: 'Note not found' }
        };
      }

      // Increment download count
      await Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } });

      // For base64 stored files, return the data
      if (note.filePath.startsWith('data:')) {
        const base64Data = note.filePath.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        return {
          status: 200,
          headers: {
            'Content-Type': note.fileType,
            'Content-Disposition': `attachment; filename="${note.fileName}"`,
            'Content-Length': buffer.length.toString()
          },
          body: buffer
        };
      }

      return {
        status: 500,
        jsonBody: { message: 'File not found' }
      };
    } catch (error) {
      context.log('Download error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
