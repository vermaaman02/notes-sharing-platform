const { connectToDatabase, Note } = require('./shared/db');
const { corsHeaders } = require('./shared/auth');

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
    await connectToDatabase();
    
    // Extract note ID from path
    const pathParts = event.path.split('/');
    const noteId = pathParts[pathParts.length - 2]; // /api/notes/{id}/download

    const note = await Note.findById(noteId);
    
    if (!note) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Note not found' })
      };
    }

    // Increment download count
    await Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } });

    // For base64 stored files, return the data
    if (note.filePath.startsWith('data:')) {
      const base64Data = note.filePath.split(',')[1];
      const mimeType = note.filePath.split(';')[0].split(':')[1];
      
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${note.fileName}"`,
          'Content-Transfer-Encoding': 'base64'
        },
        body: base64Data,
        isBase64Encoded: true
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'File not found' })
    };
  } catch (error) {
    console.error('Download error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Server error' })
    };
  }
};
