const { app } = require('@azure/functions');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false
  });
  
  cachedDb = connection;
  return connection;
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  university: { type: String },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

app.http('register', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/register',
  handler: async (request, context) => {
    try {
      await connectToDatabase();
      
      const body = await request.json();
      const { email, password, firstName, lastName, university } = body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          status: 400,
          jsonBody: { message: 'User already exists' }
        };
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        university
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        status: 201,
        jsonBody: {
          message: 'User registered successfully',
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
      context.log('Registration error:', error);
      return {
        status: 500,
        jsonBody: { message: 'Server error' }
      };
    }
  }
});
