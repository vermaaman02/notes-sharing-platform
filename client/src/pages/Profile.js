import React, { useState, useEffect } from 'react';
import config from '../config/api';
import './Profile.css';

const Profile = ({ user }) => {
  const [myNotes, setMyNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalDownloads: 0,
    totalLikes: 0
  });

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/notes/my-notes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyNotes(data);
        
        // Calculate stats
        const totalDownloads = data.reduce((sum, note) => sum + note.downloads, 0);
        const totalLikes = data.reduce((sum, note) => sum + note.likes, 0);
        
        setStats({
          totalNotes: data.length,
          totalDownloads,
          totalLikes
        });
      }
    } catch (error) {
      console.error('Error fetching my notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="user-details">
            <h1>{user.firstName} {user.lastName}</h1>
            <p className="email">{user.email}</p>
            {user.university && (
              <p className="university">🎓 {user.university}</p>
            )}
            <p className="member-since">
              Member since {formatDate(user.createdAt || new Date())}
            </p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalNotes}</div>
            <div className="stat-label">Notes Shared</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalDownloads}</div>
            <div className="stat-label">Total Downloads</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalLikes}</div>
            <div className="stat-label">Total Likes</div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="section-header">
          <h2>📚 My Uploaded Notes</h2>
          <p>Manage and track your shared notes</p>
        </div>

        {myNotes.length === 0 ? (
          <div className="no-notes">
            <div className="no-notes-icon">📝</div>
            <h3>No notes uploaded yet</h3>
            <p>Start sharing your knowledge with the community!</p>
            <a href="/upload" className="upload-cta">
              📤 Upload Your First Note
            </a>
          </div>
        ) : (
          <div className="notes-list">
            {myNotes.map((note) => (
              <div key={note._id} className="note-item">
                <div className="note-info">
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-subject">{note.subject}</p>
                  {note.description && (
                    <p className="note-description">{note.description}</p>
                  )}
                  
                  <div className="note-details">
                    <span className="detail">
                      📁 {formatFileSize(note.fileSize)}
                    </span>
                    <span className="detail">
                      📅 {formatDate(note.createdAt)}
                    </span>
                    {note.course && (
                      <span className="detail">
                        📖 {note.course}
                      </span>
                    )}
                  </div>
                </div>

                <div className="note-stats">
                  <div className="stat">
                    <span className="stat-icon">💖</span>
                    <span className="stat-value">{note.likes}</span>
                    <span className="stat-text">likes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📥</span>
                    <span className="stat-value">{note.downloads}</span>
                    <span className="stat-text">downloads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
