import React, { useState, useEffect } from 'react';
import { uploadContent, getUploadHistory } from '../utils/api';

const AdminDashboard = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    topic: '',
    sourceType: 'pdf', // 'pdf' or 'web'
    url: '',
    file: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userData, setUserData] = useState(null);

  // Class options (1-10)
  const classOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
  
  // Subject options
  const subjectOptions = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Social Science'
  ];

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user makes changes
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type for PDF
      if (formData.sourceType === 'pdf' && file.type !== 'application/pdf') {
        setError('Please select a valid PDF file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setError('');
      setSuccess('');
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix to get just the base64 string
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.class || !formData.subject || !formData.topic) {
      setError('Please fill in all required fields (Class, Subject, Topic)');
      setLoading(false);
      return;
    }

    if (formData.sourceType === 'pdf' && !formData.file) {
      setError('Please select a PDF file to upload');
      setLoading(false);
      return;
    }

    if (formData.sourceType === 'web' && !formData.url) {
      setError('Please enter a URL');
      setLoading(false);
      return;
    }

    // Validate URL format
    if (formData.sourceType === 'web') {
      try {
        new URL(formData.url);
      } catch (e) {
        setError('Please enter a valid URL');
        setLoading(false);
        return;
      }
    }

    try {
      let fileContent = null;
      let urlOrFilename = '';

      if (formData.sourceType === 'pdf') {
        // Convert PDF to base64
        fileContent = await convertFileToBase64(formData.file);
        urlOrFilename = formData.file.name;
      } else {
        urlOrFilename = formData.url;
      }

      const uploadData = {
        class: formData.class,
        subject: formData.subject,
        topic: formData.topic,
        source_type: formData.sourceType,
        url_or_filename: urlOrFilename,
        file_content: fileContent
      };

      console.log('Uploading content:', {
        ...uploadData,
        file_content: fileContent ? `[Base64 string of length ${fileContent.length}]` : null
      });

      const response = await uploadContent(uploadData);
      
      console.log('Upload successful:', response);
      setSuccess(`Content uploaded successfully! ${formData.sourceType === 'pdf' ? formData.file.name : formData.url}`);
      
      // Reset form
      setFormData({
        class: '',
        subject: '',
        topic: '',
        sourceType: 'pdf',
        url: '',
        file: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }

    setShowHistory(true);
    setLoadingHistory(true);
    setError('');

    try {
      const history = await getUploadHistory();
      setUploadHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to fetch upload history');
      setUploadHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication tokens and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-gray-200/50 shadow-lg sticky top-0 z-50 border-b transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h1 className="text-2xl font-bold text-black">EduBot Admin</h1>
              </div>
            </div>
            
            {/* Right side - Profile, Dark Mode Toggle & Logout */}
            <div className="flex items-center space-x-3">
              {/* Profile Info */}
              {userData && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 border-gray-200 rounded-lg border transition-colors duration-300">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{userData.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{userData.role || 'ADMIN'}</p>
                  </div>
                </div>
              )}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition duration-200 shadow-md hover:shadow-lg font-medium"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'border-noir-800' : 'border-gray-200'} transition-colors duration-300">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">Upload Educational Content</h2>
            <p className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">Add PDFs or web resources organized by class, subject, and topic</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
              <div className="flex items-center">
                <svg className="w-5 h-5 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
              <p className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">{error}</p>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Dropdown */}
            <div>
              <label htmlFor="class" className="block text-sm font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full px-4 py-3 border bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
                required
              >
                <option value="">Select Class</option>
                {classOptions.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
                required
              >
                <option value="">Select Subject</option>
                {subjectOptions.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Topic Input */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                Topic / Chapter Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Algebra, Thermodynamics, Photosynthesis"
                className="w-full px-4 py-3 border bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
                required
              />
            </div>

            {/* Upload Type Selection */}
            <div>
              <label className="block text-sm font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                Upload Type <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sourceType"
                    value="pdf"
                    checked={formData.sourceType === 'pdf'}
                    onChange={handleChange}
                    className="w-4 h-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
                  />
                  <span className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">PDF Upload</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sourceType"
                    value="web"
                    checked={formData.sourceType === 'web'}
                    onChange={handleChange}
                    className="w-4 h-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
                  />
                  <span className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">Web URL</span>
                </label>
              </div>
            </div>

            {/* Conditional Upload Fields */}
            {formData.sourceType === 'pdf' ? (
              <div>
                <label htmlFor="fileInput" className="block text-sm font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                  Select PDF File <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                    <svg className="w-12 h-12 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                      {formData.file ? formData.file.name : 'Click to upload PDF or drag and drop'}
                    </span>
                    <input
                      id="fileInput"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="url" className="block text-sm font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                  Web URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com/resource"
                  className="w-full px-4 py-3 border bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'focus:ring-white' : 'focus:ring-gray-900'} focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload Content'
                )}
              </button>

              <button
                type="button"
                onClick={handleViewHistory}
                className="flex-1 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'focus:ring-white' : 'focus:ring-gray-400'} focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {showHistory ? 'Hide History' : 'View History'}
              </button>
            </div>
          </form>
        </div>

        {/* Upload History Section */}
        {showHistory && (
          <div className="mt-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'border-noir-800' : 'border-gray-200'} transition-colors duration-300">
            <h3 className="text-2xl font-bold bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">Upload History</h3>
            
            {loadingHistory ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : uploadHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">No upload history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {uploadHistory.map((item, index) => (
                  <div key={index} className="border bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                            Class {item.class}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                            {item.subject}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                            {item.source_type}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">{item.topic}</h4>
                        <p className="text-sm bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">{item.url_or_filename}</p>
                        {item.upload_date && (
                          <p className="text-xs bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                            Uploaded: {new Date(item.upload_date).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {item.source_type === 'pdf' ? (
                          <svg className="w-8 h-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
