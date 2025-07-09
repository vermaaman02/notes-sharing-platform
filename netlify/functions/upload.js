const { connectToDatabase, Note } = require('./shared/db');
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

  if (event.httpMethod !== 'POST') {
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
    
    // Parse form data from the request body
    const body = JSON.parse(event.body);
    const { title, description, subject, course, university, fileData, fileName, fileType, fileSize } = body;

    if (!fileData || !fileName) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'File data is required' })
      };
    }

    const note = new Note({
      title,
      description,
      subject,
      course,
      university,
      fileName,
      filePath: fileData, // Store as base64 data URL
      fileType,
      fileSize,
      uploaderId: authResult.user.userId
    });

    await note.save();

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Note uploaded successfully',
        note: {
          _id: note._id,
          title: note.title,
          subject: note.subject,
          fileName: note.fileName
        }
      })
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Server error' })
    };
  }
};
