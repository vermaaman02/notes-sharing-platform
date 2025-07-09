import React, { useState, useEffect } from 'react';
import './Browse.css';

const Browse = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchNotes();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject, searchTerm]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:5001/api/notes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleDownload = async (noteId, fileName) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notes/${noteId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
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
        <p>Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1>📚 Browse Notes</h1>
        <p>Discover and download notes shared by students worldwide</p>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search notes by title, description, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-section">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="subject-filter"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="notes-grid">
        {notes.length === 0 ? (
          <div className="no-notes">
            <div className="no-notes-icon">📝</div>
            <h3>No notes found</h3>
            <p>Try adjusting your search or filters, or be the first to upload notes in this category!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="note-card">
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <span className="note-subject">{note.subject}</span>
              </div>

              <div className="note-content">
                {note.description && (
                  <p className="note-description">{note.description}</p>
                )}
                
                <div className="note-meta">
                  <div className="meta-item">
                    <span className="meta-label">Course:</span>
                    <span className="meta-value">{note.course || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">University:</span>
                    <span className="meta-value">{note.university || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Size:</span>
                    <span className="meta-value">{formatFileSize(note.fileSize)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Uploaded:</span>
                    <span className="meta-value">{formatDate(note.createdAt)}</span>
                  </div>
                </div>

                <div className="note-uploader">
                  <div className="uploader-info">
                    <span className="uploader-name">
                      By {note.uploaderId?.firstName} {note.uploaderId?.lastName}
                    </span>
                    {note.uploaderId?.university && (
                      <span className="uploader-uni">from {note.uploaderId.university}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="note-footer">
                <div className="note-stats">
                  <span className="stat">
                    💖 {note.likes} likes
                  </span>
                  <span className="stat">
                    📥 {note.downloads} downloads
                  </span>
                </div>
                
                <button
                  onClick={() => handleDownload(note._id, note.fileName)}
                  className="download-btn"
                >
                  📥 Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Browse;
