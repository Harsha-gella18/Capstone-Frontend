// Universal API configuration that works in both development and production
const isDevelopment = import.meta.env.DEV;

// Get API base URL from environment variables
const API_BASE_URL = isDevelopment 
  ? '/api' // Use Vite proxy in development
  : import.meta.env.VITE_API_BASE_URL; // Use environment variable in production

// Universal API call function with robust error handling
const makeApiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await processResponse(response, endpoint);
  } catch (error) {
    // Handle specific error types with user-friendly messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      if (isDevelopment) {
        throw new Error('Unable to connect to server. Please ensure the development server is running and the API endpoint is accessible.');
      } else {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
    }
    
    if (error.message.includes('NetworkError')) {
      throw new Error('Network error occurred. Please check your connection and try again.');
    }

    if (error.message.includes('CORS')) {
      throw new Error('Server configuration issue. Please contact the backend team.');
    }
    
    throw error;
  }
};

// Helper function to process API responses
const processResponse = async (response, endpoint) => {
  let data;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : { message: 'No response data' };
  }

  if (!response.ok) {
    const errorMessage = data.message || data.error || data.errorMessage || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
};

// API Functions - Universal for Development and Production
export const signupUser = async (userData) => {
  const payload = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    phone: userData.phone,
    class: userData.class,
    role: userData.role
  };
  
  return makeApiCall('signup_handler_CB', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const loginUser = async (credentials) => {
  const payload = {
    email: credentials.email,
    password: credentials.password
  };
  
  return makeApiCall('Login_handler_CB', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const verifyOTP = async (email, otp) => {
  const payload = {
    email: email,
    code: otp
  };
  
  return makeApiCall('Verify_Password_CB', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Admin Module - Upload Educational Content
export const uploadContent = async (contentData) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const payload = {
    class: contentData.class,
    subject: contentData.subject,
    topic: contentData.topic,
    source_type: contentData.source_type,
    url_or_filename: contentData.url_or_filename,
    file_content: contentData.file_content
  };

  const url = `${API_BASE_URL}/Admin_Module_CB`;
  
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(url, config);
    return await processResponse(response, 'Admin_Module_CB');
  } catch (error) {
    throw error;
  }
};

// Admin Module - Get Upload History
export const getUploadHistory = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const url = `${API_BASE_URL}/Admin_Module_CB`;
  
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await processResponse(response, 'Admin_Module_CB_History');
    return data.history || data.uploads || data.data || [];
  } catch (error) {
    return [];
  }
};

// User Dashboard - Thread Management APIs

// Get topics based on class and subject
export const getTopics = async (classNum, subject) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const url = `${API_BASE_URL}/getTopics`;
  
  const payload = {
    class: classNum,
    subject: subject
  };

  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(url, config);
    const data = await processResponse(response, 'getTopics');
    
    let topics = [];
    
    if (data.body) {
      const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
      topics = parsedBody.topics || [];
    } else if (data.topics) {
      topics = data.topics;
    }
    
    return topics;
    
  } catch (error) {
    return [];
  }
};

// Create a new chat thread
export const createThread = async (threadData) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const payload = {
    class: threadData.class,
    subject: threadData.subject,
    topic: threadData.topic
  };

  const url = `${API_BASE_URL}/createThread`;
  
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(url, config);
    return await processResponse(response, 'createThread');
  } catch (error) {
    throw error;
  }
};

// Get all threads for the user
export const getHomeThreads = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const url = `${API_BASE_URL}/get_home_threads_CB`;
  
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await processResponse(response, 'get_home_threads_CB');
    
    let threads = [];
    
    if (data.message) {
      try {
        const parsedMessage = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
        threads = parsedMessage.threads || [];
      } catch (parseError) {
        // Silent error handling
      }
    }
    else if (data.threads) {
      threads = data.threads;
    }
    else if (data.body) {
      const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
      threads = parsedBody.threads || [];
    }
    else if (Array.isArray(data)) {
      threads = data;
    }
    
    return threads;
    
  } catch (error) {
    return [];
  }
};

// Get messages for a specific thread
export const getThreadMessages = async (threadId) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const url = `${API_BASE_URL}/getThreadMessages?thread_id=${threadId}`;
  
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await processResponse(response, 'getThreadMessages');
    
    let messages = [];
    
    if (data.message && typeof data.message === 'string') {
      try {
        const parsedMessage = JSON.parse(data.message);
        messages = parsedMessage.messages || [];
      } catch (parseError) {
        // Silent error handling
      }
    }
    else if (data.messages) {
      messages = data.messages;
    }
    else if (data.body) {
      const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
      messages = parsedBody.messages || [];
    }
    else if (Array.isArray(data)) {
      messages = data;
    }
    
    return messages;
    
  } catch (error) {
    return [];
  }
};

// Send a question to the AI
export const sendUserQuery = async (queryData, onStreamUpdate = null) => {

  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const payload = {
    thread_id: queryData.thread_id,
    question: queryData.question,
    class: queryData.class,
    subject: queryData.subject,
    topic: queryData.topic
  };

  const url = `${API_BASE_URL}/User_Query_CB`;
  
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(url, config);
    const data = await processResponse(response, 'User_Query_CB');
    
    let answer = null;
    
    if (data.message) {
      try {
        const parsedMessage = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
        answer = parsedMessage.answer;
      } catch (parseError) {
        // Silent error handling
      }
    }
    else if (data.body) {
      try {
        const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        answer = parsedBody.answer;
      } catch (parseError) {
        // Silent error handling
      }
    }
    else if (data.answer) {
      answer = data.answer;
    }
    
    if (!answer) {
      answer = 'No response received from the AI.';
    }
    
    if (onStreamUpdate && answer) {
      await simulateStreaming(answer, onStreamUpdate);
    }
    
    return { answer };
    
  } catch (error) {
    throw error;
  }
};

// Simulate streaming effect by sending chunks of text progressively
const simulateStreaming = async (fullText, onUpdate) => {
  const words = fullText.split(' ');
  let currentText = '';
  
  for (let i = 0; i < words.length; i++) {
    currentText += (i > 0 ? ' ' : '') + words[i];
    onUpdate(currentText);
    
    // Adjust delay based on content (faster for regular text, slower for punctuation)
    const delay = words[i].match(/[.!?]$/) ? 100 : 30;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

export default {
  signupUser,
  loginUser,
  verifyOTP,
  uploadContent,
  getUploadHistory,
  getTopics,
  createThread,
  getHomeThreads,
  getThreadMessages,
  sendUserQuery,
};