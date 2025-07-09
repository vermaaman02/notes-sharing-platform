const { app } = require('@azure/functions');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase, User } = require('./shared/db');

app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: async (request, context) => {
    try {
      await connectToDatabase();
      
      const body = await request.json();
      const { email, password } = body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return {
          status: 400,
          jsonBody: { message: 'Invalid credentials' }
        };
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          status: 400,
          jsonBody: { message: 'Invalid credentials' }
        };
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        status: 200,
        jsonBody: {
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            university: user.university
          }
        }
      };
    } catch (error) {
      context.log('Login error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
