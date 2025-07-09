import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          📚 NoteShare
        </Link>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/browse" className="nav-link">Browse Notes</Link>
          
          {user ? (
            <>
              <Link to="/upload" className="nav-link">Upload</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="nav-button logout-btn">
                Logout
              </button>
              <span className="user-greeting">
                Hi, {user.firstName}!
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button login-btn">Login</Link>
              <Link to="/register" className="nav-button register-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
