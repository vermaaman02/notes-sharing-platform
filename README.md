# Notes Sharing Platform

A full-stack web application for students to share educational notes and resources.

## Features

- User Authentication (Register, Login, Profile Management)
- Note Upload with Metadata
- Browse Notes by Subject
- Download Notes
- Modern and Responsive UI

## Tech Stack

### Frontend
- React
- React Router
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- Multer for File Uploads

### Database
- Azure Cosmos DB with MongoDB API

## Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   cp .env.example .env
   ```
   Then update the `.env` file with your actual values:
   ```
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the application
   ```
   npm run dev
   ```

## Project Structure

- `/client`: React frontend
- `/server`: Express.js backend
- `/uploads`: Storage for uploaded notes
- `/shared`: Shared types and utilities

## License

[MIT](https://choosealicense.com/licenses/mit/)
