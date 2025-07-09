import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only images and documents are allowed!');
    }
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  university: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  course: { type: String },
  university: { type: String },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  likes: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Notes Sharing Platform API is running!' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, university } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate token
app.get('/api/auth/validate', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      valid: true, 
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload note
app.post('/api/notes/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, subject, course, university } = req.body;

    const note = new Note({
      title,
      description,
      subject,
      course,
      university,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploaderId: req.user.userId
    });

    await note.save();

    res.status(201).json({
      message: 'Note uploaded successfully',
      note
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const { subject, search } = req.query;
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

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's notes
app.get('/api/notes/my-notes', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ uploaderId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get user notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download note
app.get('/api/notes/:id/download', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment download count
    await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

    const filePath = path.resolve(note.filePath);
    res.download(filePath, note.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subjects list
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Note.distinct('subject');
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Database connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB at:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false // Required for Azure Cosmos DB
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
