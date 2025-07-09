# Netlify Deployment Guide

## Steps to Deploy on Netlify

### 1. Push to GitHub
Make sure all your code is pushed to your GitHub repository.

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with your GitHub account
3. Click "New site from Git"
4. Choose your GitHub repository
5. Select the branch (usually `main` or `master`)

### 3. Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `client/dist`
- **Functions directory:** `netlify/functions`

### 4. Environment Variables
Go to Site settings > Environment variables and add:

**MONGODB_URI**
```
Your MongoDB/Cosmos DB connection string
Example: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**JWT_SECRET**
```
A secure secret key for JWT tokens
Example: your-super-secure-jwt-secret-key-here
```

### 5. Deploy
Click "Deploy site" and wait for the build to complete.

### 6. Test Your App
Once deployed, test:
- User registration
- User login
- File upload (if implemented)
- Browse notes
- API endpoints at `yoursite.netlify.app/api/...`

## API Endpoints
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/auth/validate` - Token validation
- `/api/notes` - Get all notes
- `/api/subjects` - Get all subjects

## Local Development
```bash
# Install dependencies
npm install
cd client && npm install
cd ../netlify/functions && npm install

# Run locally
npm run dev
```

## Troubleshooting
1. Check Netlify function logs in the dashboard
2. Ensure environment variables are set correctly
3. Make sure MongoDB connection string is valid
4. Check CORS settings if you get cross-origin errors
