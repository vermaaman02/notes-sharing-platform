import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Browse from './pages/Browse';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Parse and validate user data
        const parsedUser = JSON.parse(userData);
        
        // Basic token format validation
        if (token && token.includes('.') && parsedUser.id) {
          setUser(parsedUser);
        } else {
          // Invalid token format, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // Invalid JSON in localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} logout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/browse" /> : <Login onLogin={login} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/browse" /> : <Register onLogin={login} />} 
            />
            <Route 
              path="/upload" 
              element={user ? <Upload user={user} /> : <Navigate to="/login" />} 
            />
            <Route path="/browse" element={<Browse user={user} />} />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
