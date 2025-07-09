import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Share Knowledge, Excel Together
          </h1>
          <p className="hero-subtitle">
            The ultimate platform for students to share, discover, and download academic notes. 
            Build your knowledge network and succeed in your studies.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="cta-button primary">
              Get Started Free
            </Link>
            <Link to="/browse" className="cta-button secondary">
              Browse Notes
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card">
            <div className="card-header">📄</div>
            <div className="card-body">
              <h3>Computer Science</h3>
              <p>Data Structures & Algorithms</p>
              <span className="downloads">1.2k downloads</span>
            </div>
          </div>
          <div className="floating-card card-2">
            <div className="card-header">📊</div>
            <div className="card-body">
              <h3>Mathematics</h3>
              <p>Calculus Notes</p>
              <span className="downloads">856 downloads</span>
            </div>
          </div>
          <div className="floating-card card-3">
            <div className="card-header">🧪</div>
            <div className="card-body">
              <h3>Chemistry</h3>
              <p>Organic Chemistry</p>
              <span className="downloads">643 downloads</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose NoteShare?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Vast Library</h3>
              <p>Access thousands of notes across various subjects and courses from students worldwide.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Safe</h3>
              <p>Your uploads are protected with advanced security measures and user authentication.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Easy</h3>
              <p>Upload and download notes instantly with our user-friendly interface and quick search.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Quality Content</h3>
              <p>All notes are reviewed and rated by the community to ensure high-quality content.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Notes Shared</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Universities</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Subjects</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
