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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">EduBot Admin</h1>
                  <p className="text-xs text-gray-500">Content Management</p>
                </div>
              </div>
            </div>
            
            {/* Right side - Profile & Logout */}
            <div className="flex items-center space-x-4">
              {/* Profile Info */}
              {userData && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{(userData.name || 'Admin')[0].toUpperCase()}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{userData.name || 'Admin'}</p>
                    <p className="text-xs text-indigo-600 font-medium">{userData.role || 'ADMIN'}</p>
                  </div>
                </div>
              )}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Upload Educational Content</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Enrich your learning platform by adding PDFs or web resources organized by class, subject, and topic</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          <div className="p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grid Layout for Class and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Dropdown */}
                <div>
                  <label htmlFor="class" className="block text-sm font-semibold text-gray-700 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 hover:border-indigo-300"
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
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 hover:border-indigo-300"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjectOptions.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic Input */}
              <div>
                <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic / Chapter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g., Algebra, Thermodynamics, Photosynthesis"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-indigo-300"
                  required
                />
              </div>

              {/* Upload Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.sourceType === 'pdf' 
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50' 
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="sourceType"
                      value="pdf"
                      checked={formData.sourceType === 'pdf'}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <svg className={`w-6 h-6 ${formData.sourceType === 'pdf' ? 'text-indigo-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className={`font-medium ${formData.sourceType === 'pdf' ? 'text-indigo-700' : 'text-gray-600'}`}>PDF Upload</span>
                  </label>
                  <label className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.sourceType === 'web' 
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50' 
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="sourceType"
                      value="web"
                      checked={formData.sourceType === 'web'}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <svg className={`w-6 h-6 ${formData.sourceType === 'web' ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className={`font-medium ${formData.sourceType === 'web' ? 'text-indigo-700' : 'text-gray-600'}`}>Web URL</span>
                  </label>
                </div>
              </div>

              {/* Conditional Upload Fields */}
              {formData.sourceType === 'pdf' ? (
                <div>
                  <label htmlFor="fileInput" className="block text-sm font-semibold text-gray-700 mb-2">
                    Select PDF File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center px-6 py-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-100 transition-all duration-200">
                      <svg className="w-16 h-16 text-indigo-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-base font-medium text-indigo-600 mb-1">
                        {formData.file ? formData.file.name : 'Click to upload PDF'}
                      </span>
                      <span className="text-xs text-gray-500">or drag and drop</span>
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
                  <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                    Web URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      id="url"
                      name="url"
                      value={formData.url}
                      onChange={handleChange}
                      placeholder="https://example.com/resource"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-indigo-300"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Content</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleViewHistory}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-white text-indigo-600 font-semibold border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 focus:ring-4 focus:ring-indigo-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{showHistory ? 'Hide History' : 'View History'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Upload History Section */}
        {showHistory && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Upload History</h3>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 font-semibold rounded-lg">
                  {uploadHistory.length} {uploadHistory.length === 1 ? 'Upload' : 'Uploads'}
                </span>
              </div>
              
              {loadingHistory ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600 font-medium">Loading history...</p>
                </div>
              ) : uploadHistory.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Upload History</h4>
                  <p className="text-gray-500">Start uploading content to see your history here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadHistory.map((item, index) => (
                    <div key={index} className="group p-5 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                              </svg>
                              Class {item.class}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-700">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                              </svg>
                              {item.subject}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700">
                              {item.source_type === 'pdf' ? (
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                              )}
                              {item.source_type.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">{item.topic}</h4>
                          <p className="text-sm text-gray-600 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {item.url_or_filename}
                          </p>
                          {item.upload_date && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(item.upload_date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors duration-200">
                            {item.source_type === 'pdf' ? (
                              <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
