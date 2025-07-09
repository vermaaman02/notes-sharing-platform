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
    
    const subjects = await Note.distinct('subject');
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(subjects)
    };
  } catch (error) {
    console.error('Get subjects error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Server error' })
    };
  }
};
