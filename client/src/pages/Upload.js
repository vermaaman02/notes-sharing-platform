import React, { useState, useEffect } from 'react';
import config from '../config/api';
import './Upload.css';

const Upload = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    course: '',
    university: user?.university || ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/subjects`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        console.log('Failed to fetch subjects:', response.status);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('subject', formData.subject);
    uploadData.append('course', formData.course);
    uploadData.append('university', formData.university);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/notes/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Note uploaded successfully!');
        setFormData({
          title: '',
          description: '',
          subject: '',
          course: '',
          university: user?.university || ''
        });
        setFile(null);
        // Reset file input
        document.getElementById('file-input').value = '';
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h1>📤 Upload Your Notes</h1>
          <p>Share your knowledge with fellow students worldwide</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Note Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Data Structures and Algorithms - Complete Notes"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe what your notes cover, difficulty level, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                list="subjects-list"
                placeholder="e.g., Computer Science, Mathematics"
              />
              <datalist id="subjects-list">
                {subjects.map((subject, index) => (
                  <option key={index} value={subject} />
                ))}
              </datalist>
            </div>
            <div className="form-group">
              <label htmlFor="course">Course</label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g., CS101, MATH201"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="university">University</label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="Your university name"
            />
          </div>

          <div className="form-group file-upload-group">
            <label htmlFor="file-input">Upload File *</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                required
              />
              <div className="file-upload-text">
                {file ? (
                  <span className="file-selected">
                    📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                ) : (
                  <>
                    <span>Click to select a file or drag and drop</span>
                    <small>Supported: PDF, DOC, PPT, TXT, Images (Max 10MB)</small>
                  </>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="upload-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                📤 Upload Notes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
