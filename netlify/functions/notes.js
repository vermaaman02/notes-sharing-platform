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
    
    const { subject, search } = event.queryStringParameters || {};
    
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
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(notes)
    };
  } catch (error) {
    console.error('Get notes error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Server error' })
    };
  }
};
