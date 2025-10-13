import React, { useState, useEffect, useRef } from 'react';
import { createThread, getHomeThreads, getThreadMessages, sendUserQuery, getTopics } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const UserDashboard = ({ onLogout, darkMode, toggleDarkMode }) => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Class and subject options
  const classOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
  const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Science'];

  // Load user data and threads on mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    loadThreads();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    setThreadsLoading(true);
    setError('');
    try {
      const fetchedThreads = await getHomeThreads();
      setThreads(fetchedThreads);
    } catch (err) {
      setError(err.message || 'Failed to load threads');
    } finally {
      setThreadsLoading(false);
    }
  };

  const loadThreadMessages = async (thread) => {
    setActiveThread(thread);
    setLoading(true);
    setError('');
    setMessages([]);
    
    try {
      const fetchedMessages = await getThreadMessages(thread.thread_id);
      setMessages(fetchedMessages);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !activeThread) return;

    const userMessage = {
      sender: 'user',
      message: messageInput,
      timestamp: new Date().toISOString()
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = messageInput;
    setMessageInput('');
    setSendingMessage(true);
    setError('');

    // Create placeholder for AI message that will be updated during streaming
    const aiMessageId = Date.now();
    const initialAiMessage = {
      id: aiMessageId,
      sender: 'ai',
      message: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, initialAiMessage]);

    try {
      // Stream update callback
      const handleStreamUpdate = (partialText) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, message: partialText }
              : msg
          )
        );
      };

      const response = await sendUserQuery({
        thread_id: activeThread.thread_id,
        question: currentMessage,
        class: activeThread.class,
        subject: activeThread.subject,
        topic: activeThread.topic
      }, handleStreamUpdate);

      // Mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, message: response.answer || 'No response received.', isStreaming: false }
            : msg
        )
      );
      
    } catch (err) {
      setError(err.message || 'Failed to send message');
      // Remove both user message and AI placeholder if sending failed
      setMessages(prev => prev.slice(0, -2));
      setMessageInput(currentMessage); // Restore the message
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication tokens and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-noir-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'}`}>
      {/* Top Navbar */}
      <nav className={`${darkMode ? 'bg-noir-900 border-noir-800' : 'bg-white/80 backdrop-blur-xl border-gray-200/50'} border-b shadow-lg z-50`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & User Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${darkMode ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-gray-900 to-black'} rounded-2xl flex items-center justify-center shadow-xl`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h1 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  EduBot AI
                </h1>
              </div>
              
              {userData && (
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl ${darkMode ? 'bg-noir-800 border border-noir-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gradient-to-br from-gray-600 to-gray-800' : 'bg-gradient-to-br from-gray-700 to-black'} flex items-center justify-center text-white font-black text-sm shadow-md`}>
                    {userData.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="flex flex-col">
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.name || 'Student'}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {userData.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Create Thread Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className={`${darkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black'} px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Thread</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-xl transition-all duration-300 ${darkMode ? 'bg-noir-800 text-yellow-400 hover:bg-noir-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} hover:scale-110 shadow-md`}
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`p-2.5 rounded-xl transition-all duration-300 ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'} hover:scale-110 shadow-md`}
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar */}
      <div className={`w-80 ${darkMode ? 'bg-noir-900 border-noir-800' : 'bg-white/60 backdrop-blur-xl border-gray-200/70'} border-r flex flex-col shadow-xl`}>
        {/* Sidebar Header */}
        <div className={`p-4 ${darkMode ? 'border-noir-800' : 'border-gray-200/60'} border-b`}>
          <h2 className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Your Conversations
          </h2>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {threadsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className={`animate-spin rounded-full h-12 w-12 border-4 ${darkMode ? 'border-gray-800 border-t-gray-400' : 'border-gray-200 border-t-gray-900'}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-6 h-6 ${darkMode ? 'bg-gradient-to-r from-gray-500 to-gray-300' : 'bg-gradient-to-r from-gray-700 to-black'} rounded-full animate-pulse`}></div>
                </div>
              </div>
            </div>
          ) : threads.length === 0 ? (
            <div className={`text-center py-16 ${darkMode ? 'bg-noir-900/50' : 'bg-gradient-to-br from-gray-50 to-white'} rounded-2xl border-2 border-dashed ${darkMode ? 'border-noir-800' : 'border-gray-300'} shadow-lg`}>
              <div className="relative inline-block">
                <div className={`w-20 h-20 ${darkMode ? 'bg-gradient-to-br from-noir-800 to-noir-900' : 'bg-gradient-to-br from-gray-100 to-gray-50'} rounded-full flex items-center justify-center mb-4 shadow-lg`}>
                  <svg className={`w-10 h-10 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className={`absolute -top-2 -right-2 w-6 h-6 ${darkMode ? 'bg-gray-500' : 'bg-gray-800'} rounded-full animate-bounce`}></div>
              </div>
              <p className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>No conversations yet</p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>Start learning by creating your first thread!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <button
                  key={thread.thread_id}
                  onClick={() => loadThreadMessages(thread)}
                  className={`group w-full text-left p-4 rounded-2xl transition-all duration-300 transform hover:scale-102 ${
                    activeThread?.thread_id === thread.thread_id
                      ? `${darkMode ? 'bg-gradient-to-br from-noir-800 to-noir-900 border-2 border-gray-500 shadow-2xl' : 'bg-gradient-to-br from-gray-900 to-black text-white border-2 border-gray-800 shadow-2xl'}`
                      : `${darkMode ? 'bg-noir-900/50 hover:bg-noir-800/80 border border-noir-700' : 'bg-white hover:bg-gray-50 border border-gray-300'} hover:shadow-xl`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-8 h-8 rounded-xl ${
                          activeThread?.thread_id === thread.thread_id
                            ? `${darkMode ? 'bg-gradient-to-br from-gray-600 to-gray-800' : 'bg-gradient-to-br from-white to-gray-100'}`
                            : `${darkMode ? 'bg-gradient-to-br from-gray-600 to-gray-800' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`
                        } flex items-center justify-center shadow-md`}>
                          <svg className={`w-4 h-4 ${activeThread?.thread_id === thread.thread_id && !darkMode ? 'text-gray-900' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <p className={`text-sm font-bold truncate ${
                          activeThread?.thread_id === thread.thread_id
                            ? `${darkMode ? 'text-white' : 'text-white'}`
                            : `${darkMode ? 'text-white' : 'text-gray-900'}`
                        }`}>
                          {thread.topic}
                        </p>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                          activeThread?.thread_id === thread.thread_id
                            ? `${darkMode ? 'bg-noir-800 text-gray-300 border border-noir-700' : 'bg-white/20 text-white border border-white/30'}`
                            : `${darkMode ? 'bg-noir-800 text-gray-300 border border-noir-700' : 'bg-gray-50 text-gray-700 border border-gray-200'}`
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          Class {thread.class}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                          activeThread?.thread_id === thread.thread_id
                            ? `${darkMode ? 'bg-noir-800 text-gray-300 border border-noir-700' : 'bg-white/20 text-white border border-white/30'}`
                            : `${darkMode ? 'bg-noir-800 text-gray-300 border border-noir-700' : 'bg-gray-50 text-gray-700 border border-gray-200'}`
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                          {thread.subject}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 space-x-2">
                        <svg className={`w-3 h-3 ${
                          activeThread?.thread_id === thread.thread_id
                            ? `${darkMode ? 'text-gray-600' : 'text-white/60'}`
                            : `${darkMode ? 'text-gray-600' : 'text-gray-400'}`
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <p className={`text-xs ${
                          activeThread?.thread_id === thread.thread_id
                            ? `${darkMode ? 'text-gray-600' : 'text-white/70'}`
                            : `${darkMode ? 'text-gray-600' : 'text-gray-500'}`
                        }`}>
                          {new Date(thread.last_updated || thread.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {activeThread?.thread_id === thread.thread_id && (
                      <div className="ml-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <>
            {/* Chat Header */}
            <div className={`${darkMode ? 'bg-noir-900 border-noir-700' : 'bg-white/80 backdrop-blur-xl border-gray-200/60'} border-b p-4 shadow-lg transition-colors duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activeThread.topic}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Class {activeThread.class}</span>
                    <span className={`${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activeThread.subject}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-noir-950' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300`}>
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-white' : 'border-gray-900'}`}></div>
                </div>
              ) : messages.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm">Ask a question to begin learning!</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-2xl rounded-2xl p-4 shadow-lg ${
                          msg.sender === 'user'
                            ? darkMode 
                              ? 'bg-noir-900 text-white border border-noir-700' 
                              : 'bg-gradient-to-br from-gray-900 to-black text-white'
                            : darkMode
                              ? 'bg-noir-800 text-gray-100 border border-noir-700'
                              : 'bg-white text-gray-900 border-2 border-gray-200'
                        } transition-all duration-300`}
                      >
                        <div className="flex items-start space-x-2">
                          {msg.sender === 'ai' && (
                            <div className={`flex-shrink-0 w-8 h-8 rounded-xl ${darkMode ? 'bg-noir-700' : 'bg-gradient-to-br from-gray-100 to-gray-200'} flex items-center justify-center shadow-md`}>
                              <svg className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1">
                            {msg.sender === 'ai' ? (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    // Style tables
                                    table: ({node, ...props}) => (
                                      <div className="overflow-x-auto my-4">
                                        <table className={`min-w-full divide-y ${darkMode ? 'divide-noir-700 border-noir-700' : 'divide-gray-300 border-gray-300'} border`} {...props} />
                                      </div>
                                    ),
                                    thead: ({node, ...props}) => (
                                      <thead className={darkMode ? 'bg-noir-900' : 'bg-gray-50'} {...props} />
                                    ),
                                    th: ({node, ...props}) => (
                                      <th className={`px-4 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-100 border-noir-700' : 'text-gray-900 border-gray-300'} uppercase tracking-wider border-b`} {...props} />
                                    ),
                                    td: ({node, ...props}) => (
                                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300 border-noir-700' : 'text-gray-700 border-gray-200'} border-b`} {...props} />
                                    ),
                                    tbody: ({node, ...props}) => (
                                      <tbody className={`${darkMode ? 'bg-noir-800 divide-noir-700' : 'bg-white divide-gray-200'} divide-y`} {...props} />
                                    ),
                                    // Style headers
                                    h1: ({node, ...props}) => (
                                      <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mt-6 mb-4`} {...props} />
                                    ),
                                    h2: ({node, ...props}) => (
                                      <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mt-5 mb-3`} {...props} />
                                    ),
                                    h3: ({node, ...props}) => (
                                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mt-4 mb-2`} {...props} />
                                    ),
                                    // Style lists
                                    ul: ({node, ...props}) => (
                                      <ul className="list-disc list-inside space-y-1 my-3" {...props} />
                                    ),
                                    ol: ({node, ...props}) => (
                                      <ol className="list-decimal list-inside space-y-1 my-3" {...props} />
                                    ),
                                    li: ({node, ...props}) => (
                                      <li className={darkMode ? 'text-gray-300' : 'text-gray-700'} {...props} />
                                    ),
                                    // Style paragraphs
                                    p: ({node, ...props}) => (
                                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} my-2 leading-relaxed`} {...props} />
                                    ),
                                    // Style code blocks
                                    code: ({node, inline, ...props}) => 
                                      inline ? (
                                        <code className={`${darkMode ? 'bg-noir-900 text-gray-300' : 'bg-gray-100 text-gray-900'} px-1.5 py-0.5 rounded text-sm font-mono`} {...props} />
                                      ) : (
                                        <code className={`block ${darkMode ? 'bg-black text-gray-100' : 'bg-gray-900 text-gray-100'} p-4 rounded-lg overflow-x-auto text-sm font-mono my-3`} {...props} />
                                      ),
                                    // Style blockquotes
                                    blockquote: ({node, ...props}) => (
                                      <blockquote className={`border-l-4 ${darkMode ? 'border-gray-400 text-gray-400' : 'border-gray-500 text-gray-600'} pl-4 italic my-3`} {...props} />
                                    ),
                                    // Style links
                                    a: ({node, ...props}) => (
                                      <a className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} underline`} {...props} />
                                    ),
                                    // Style horizontal rules
                                    hr: ({node, ...props}) => (
                                      <hr className={`my-6 ${darkMode ? 'border-noir-700' : 'border-gray-300'}`} {...props} />
                                    ),
                                    // Style strong/bold
                                    strong: ({node, ...props}) => (
                                      <strong className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />
                                    ),
                                    // Style emphasis/italic
                                    em: ({node, ...props}) => (
                                      <em className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} {...props} />
                                    ),
                                  }}
                                >
                                  {msg.message}
                                </ReactMarkdown>
                                {msg.isStreaming && (
                                  <span className={`inline-block w-2 h-4 ml-1 ${darkMode ? 'bg-white' : 'bg-black'} animate-pulse`}></span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            )}
                            <p className={`text-xs mt-1 ${msg.sender === 'user' ? (darkMode ? 'text-gray-400' : 'text-gray-300') : (darkMode ? 'text-gray-500' : 'text-gray-500')}`}>
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className={`px-4 py-2 ${darkMode ? 'bg-red-950 border-red-900' : 'bg-red-50 border-red-200'} border-t transition-colors duration-300`}>
                <p className={`${darkMode ? 'text-red-300' : 'text-red-600'} text-sm`}>{error}</p>
              </div>
            )}

            {/* Message Input */}
            <div className={`${darkMode ? 'bg-noir-900 border-noir-700' : 'bg-white/80 backdrop-blur-xl border-gray-200/60'} border-t p-4 shadow-2xl transition-colors duration-300`}>
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={sendingMessage}
                  className={`flex-1 px-4 py-3 border-2 ${darkMode ? 'bg-noir-800 border-noir-700 text-white placeholder-gray-500 focus:ring-white focus:border-white' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-gray-900 focus:border-gray-900'} rounded-xl focus:ring-2 disabled:opacity-50 transition-all duration-300 shadow-sm`}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sendingMessage}
                  className={`${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-gradient-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900'} px-6 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-bold shadow-lg hover:shadow-xl`}
                >
                  {sendingMessage ? (
                    <>
                      <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${darkMode ? 'border-black' : 'border-white'}`}></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-noir-950' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300`}>
            <div className="text-center">
              <svg className={`mx-auto h-24 w-24 ${darkMode ? 'text-gray-600' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className={`mt-4 text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Welcome to EduBot!</h3>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select a thread or create a new one to start learning</p>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Create Thread Modal */}
      {showCreateModal && (
        <CreateThreadModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newThread) => {
            setThreads(prev => [newThread, ...prev]);
            setShowCreateModal(false);
            loadThreadMessages(newThread);
          }}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Create Thread Modal Component
const CreateThreadModal = ({ onClose, onSuccess, classOptions, subjectOptions, darkMode }) => {
  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    topic: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Fetch topics when class and subject are selected
  useEffect(() => {
    const fetchTopics = async () => {
      if (formData.class && formData.subject) {
        setLoadingTopics(true);
        setError('');
        try {
          const fetchedTopics = await getTopics(formData.class, formData.subject);
          setTopics(fetchedTopics);
          setFormData(prev => ({ ...prev, topic: '' }));
        } catch (err) {
          setError('Failed to load topics. Please try again.');
          setTopics([]);
        } finally {
          setLoadingTopics(false);
        }
      } else {
        setTopics([]);
        setFormData(prev => ({ ...prev, topic: '' }));
      }
    };

    fetchTopics();
  }, [formData.class, formData.subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.class || !formData.subject || !formData.topic) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createThread(formData);
      
      const newThread = {
        thread_id: response.thread_id,
        class: formData.class,
        subject: formData.subject,
        topic: formData.topic,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      onSuccess(newThread);
    } catch (err) {
      setError(err.message || 'Failed to create thread');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-noir-900' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6 transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Thread</h2>
          <button
            onClick={onClose}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className={`mb-4 p-3 ${darkMode ? 'bg-red-950 border-red-900' : 'bg-red-50 border-red-200'} border rounded-lg transition-colors duration-300`}>
            <p className={`${darkMode ? 'text-red-300' : 'text-red-600'} text-sm`}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="class" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Class <span className="text-red-500">*</span>
            </label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${darkMode ? 'bg-noir-800 border-noir-700 text-white focus:ring-white focus:border-white' : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black'} rounded-lg focus:ring-2 transition-colors duration-300`}
              required
            >
              <option value="">Select Class</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${darkMode ? 'bg-noir-800 border-noir-700 text-white focus:ring-white focus:border-white' : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black'} rounded-lg focus:ring-2 transition-colors duration-300`}
              required
            >
              <option value="">Select Subject</option>
              {subjectOptions.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="topic" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Topic / Chapter <span className="text-red-500">*</span>
            </label>
            <select
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              disabled={!formData.class || !formData.subject || loadingTopics}
              className={`w-full px-4 py-2 border ${darkMode ? 'bg-noir-800 border-noir-700 text-white focus:ring-white focus:border-white disabled:bg-noir-950' : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black disabled:bg-gray-100'} rounded-lg focus:ring-2 disabled:cursor-not-allowed transition-colors duration-300`}
              required
            >
              <option value="">
                {!formData.class || !formData.subject
                  ? 'Select class and subject first'
                  : loadingTopics
                  ? 'Loading topics...'
                  : topics.length === 0
                  ? 'No topics available'
                  : 'Select Topic'}
              </option>
              {topics.map((topic, index) => (
                <option key={index} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            {loadingTopics && (
              <div className={`mt-2 flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${darkMode ? 'border-white' : 'border-black'} mr-2`}></div>
                Loading topics...
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 border ${darkMode ? 'border-noir-700 text-gray-300 hover:bg-noir-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition duration-200 font-medium`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-4 py-2 rounded-lg disabled:opacity-40 transition duration-200 font-medium`}
            >
              {loading ? 'Creating...' : 'Create Thread'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDashboard;
