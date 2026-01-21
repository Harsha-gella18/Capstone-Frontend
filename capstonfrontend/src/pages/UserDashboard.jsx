import React, { useState, useEffect, useRef } from 'react';
import { createThread, getHomeThreads, getThreadMessages, sendUserQuery, getTopics } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceInput from '../components/VoiceInput';

const UserDashboard = ({ onLogout }) => {
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

  const handleVoiceTranscript = (transcript) => {
    // Set the transcript as the message input
    setMessageInput(transcript);
  };

  const handleSuggestionSelect = (suggestion) => {
    // Set the selected suggestion as the message input
    setMessageInput(suggestion);
    // Optionally auto-focus the input field
    // You can add a ref to the input if you want to focus it
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
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-soft z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & User Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-xl flex items-center justify-center shadow-medium">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-heading font-bold tracking-tight text-[#0F172A]">
                  EduBot AI
                </h1>
              </div>
              
              {userData && (
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-[#F1F5F9] border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-white font-bold text-sm shadow-soft">
                    {userData.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {userData.name || 'Student'}
                    </p>
                    <p className="text-xs text-[#64748B]">
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
                className="bg-[#2563EB] text-white hover:bg-[#1E40AF] px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-0.5 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Thread</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl transition-all duration-200 text-[#DC2626] hover:bg-[#FEE2E2] shadow-soft"
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
      <div className="w-80 bg-[#F1F5F9] border-r border-gray-200 flex flex-col shadow-soft">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Your Conversations
          </h2>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {threadsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#DBEAFE] border-t-[#2563EB]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-soft">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-[#DBEAFE] to-[#F1F5F9] rounded-full flex items-center justify-center mb-4 shadow-medium">
                  <svg className="w-10 h-10 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#2563EB] rounded-full animate-bounce"></div>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">No conversations yet</p>
              <p className="text-xs mt-1 text-[#64748B]">Start learning by creating your first thread!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <button
                  key={thread.thread_id}
                  onClick={() => loadThreadMessages(thread)}
                  className={`group w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    activeThread?.thread_id === thread.thread_id
                      ? 'bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white shadow-strong border-2 border-[#1E40AF]'
                      : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-[#DBEAFE] hover:shadow-medium'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activeThread?.thread_id === thread.thread_id
                            ? 'bg-white/20'
                            : 'bg-[#DBEAFE]'
                        }`}>
                          <svg className={`w-4 h-4 ${activeThread?.thread_id === thread.thread_id ? 'text-white' : 'text-[#2563EB]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <p className={`text-sm font-semibold truncate ${
                          activeThread?.thread_id === thread.thread_id ? 'text-white' : 'text-[#0F172A]'
                        }`}>
                          {thread.topic}
                        </p>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          activeThread?.thread_id === thread.thread_id
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F1F5F9] text-[#334155]'
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          Class {thread.class}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          activeThread?.thread_id === thread.thread_id
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F1F5F9] text-[#334155]'
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                          {thread.subject}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 space-x-2">
                        <svg className={`w-3 h-3 ${
                          activeThread?.thread_id === thread.thread_id ? 'text-white/70' : 'text-[#64748B]'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <p className={`text-xs ${
                          activeThread?.thread_id === thread.thread_id ? 'text-white/80' : 'text-[#64748B]'
                        }`}>
                          {new Date(thread.last_updated || thread.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {activeThread?.thread_id === thread.thread_id && (
                      <div className="ml-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
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
            <div className="bg-white border-b border-gray-200 p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-heading font-bold text-[#0F172A]">{activeThread.topic}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-[#334155] font-medium">Class {activeThread.class}</span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span className="text-sm text-[#334155] font-medium">{activeThread.subject}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#DBEAFE] border-t-[#2563EB]"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#64748B]">
                  <svg className="w-16 h-16 mb-4 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-lg font-semibold text-[#334155]">Start a conversation</p>
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
                        className={`max-w-2xl rounded-xl p-5 ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white shadow-medium'
                            : 'bg-white text-[#334155] shadow-soft border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {msg.sender === 'ai' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#DBEAFE] to-[#93C5FD] flex items-center justify-center shadow-sm">
                              <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props} />
                                      </div>
                                    ),
                                    thead: ({node, ...props}) => (
                                      <thead className="bg-[#F8FAFC]" {...props} />
                                    ),
                                    th: ({node, ...props}) => (
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#0F172A] border-b-2 border-gray-200 uppercase tracking-wider" {...props} />
                                    ),
                                    td: ({node, ...props}) => (
                                      <td className="px-4 py-3 text-sm text-[#334155] border-b border-gray-100" {...props} />
                                    ),
                                    tbody: ({node, ...props}) => (
                                      <tbody className="bg-white divide-y divide-gray-100" {...props} />
                                    ),
                                    // Style headers
                                    h1: ({node, ...props}) => (
                                      <h1 className="text-2xl font-heading font-bold text-[#0F172A] mt-6 mb-4" {...props} />
                                    ),
                                    h2: ({node, ...props}) => (
                                      <h2 className="text-xl font-heading font-bold text-[#0F172A] mt-5 mb-3" {...props} />
                                    ),
                                    h3: ({node, ...props}) => (
                                      <h3 className="text-lg font-heading font-semibold text-[#0F172A] mt-4 mb-2" {...props} />
                                    ),
                                    // Style lists
                                    ul: ({node, ...props}) => (
                                      <ul className="list-disc list-inside space-y-2 my-3" {...props} />
                                    ),
                                    ol: ({node, ...props}) => (
                                      <ol className="list-decimal list-inside space-y-2 my-3" {...props} />
                                    ),
                                    li: ({node, ...props}) => (
                                      <li className="text-[#334155]" {...props} />
                                    ),
                                    // Style paragraphs
                                    p: ({node, ...props}) => (
                                      <p className="text-[#334155] my-2 leading-relaxed" {...props} />
                                    ),
                                    // Style code blocks
                                    code: ({node, inline, ...props}) => 
                                      inline ? (
                                        <code className="bg-[#F1F5F9] text-[#0F172A] px-1.5 py-0.5 rounded text-sm font-mono font-medium border border-gray-200" {...props} />
                                      ) : (
                                        <code className="block bg-[#0F172A] text-[#E5E7EB] p-4 rounded-xl overflow-x-auto text-sm font-mono my-3 shadow-soft" {...props} />
                                      ),
                                    // Style blockquotes
                                    blockquote: ({node, ...props}) => (
                                      <blockquote className="border-l-4 border-[#2563EB] bg-[#DBEAFE] text-[#334155] pl-4 pr-4 py-3 rounded-r-lg italic my-3" {...props} />
                                    ),
                                    // Style links
                                    a: ({node, ...props}) => (
                                      <a className="text-[#2563EB] hover:text-[#1E40AF] underline font-medium" {...props} />
                                    ),
                                    // Style horizontal rules
                                    hr: ({node, ...props}) => (
                                      <hr className="my-6 border-gray-200" {...props} />
                                    ),
                                    // Style strong/bold
                                    strong: ({node, ...props}) => (
                                      <strong className="font-bold text-[#0F172A]" {...props} />
                                    ),
                                    // Style emphasis/italic
                                    em: ({node, ...props}) => (
                                      <em className="italic text-[#334155]" {...props} />
                                    ),
                                  }}
                                >
                                  {msg.message}
                                </ReactMarkdown>
                                {msg.isStreaming && (
                                  <span className="inline-block w-2 h-4 ml-1 bg-[#2563EB] animate-pulse"></span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.message}
                              </p>
                            )}
                            <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-white/70' : 'text-[#64748B]'}`}>
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
              <div className="px-4 py-3 bg-[#FEE2E2] border-t-2 border-[#DC2626]">
                <p className="text-[#DC2626] text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Smart Suggestions - Component not yet implemented */}
            {/* {activeThread && !sendingMessage && (
              <SmartSuggestions 
                topic={activeThread.topic}
                subject={activeThread.subject}
                onSelect={handleSuggestionSelect}
              />
            )} */}

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-5 shadow-strong">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ask a question or use voice input..."
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 bg-white text-[#334155] placeholder-[#64748B] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] disabled:opacity-50 disabled:bg-gray-50 transition-all duration-200 shadow-soft"
                />
                
                {/* Voice Input Button */}
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  disabled={sendingMessage}
                />
                
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sendingMessage}
                  className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white px-8 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-semibold shadow-medium hover:shadow-strong hover:-translate-y-0.5"
                >
                  {sendingMessage ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
          <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
            <div className="text-center">
              <svg className="mx-auto h-24 w-24 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-4 text-lg font-heading font-bold text-[#0F172A]">Welcome to EduBot!</h3>
              <p className="mt-2 text-sm text-[#64748B]">Select a thread or create a new one to start learning</p>
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
        />
      )}
    </div>
  );
};

// Create Thread Modal Component
const CreateThreadModal = ({ onClose, onSuccess, classOptions, subjectOptions }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-strong max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-[#0F172A]">Create New Thread</h2>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-[#FEE2E2] border-l-4 border-[#DC2626] rounded-lg">
            <p className="text-[#DC2626] text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="class" className="block text-sm font-semibold text-[#0F172A] mb-2">
              Class <span className="text-[#DC2626]">*</span>
            </label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-[#334155] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-all shadow-soft"
              required
            >
              <option value="">Select Class</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-[#0F172A] mb-2">
              Subject <span className="text-[#DC2626]">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-[#334155] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-all shadow-soft"
              required
            >
              <option value="">Select Subject</option>
              {subjectOptions.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-semibold text-[#0F172A] mb-2">
              Topic / Chapter <span className="text-[#DC2626]">*</span>
            </label>
            <select
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              disabled={!formData.class || !formData.subject || loadingTopics}
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-[#334155] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] disabled:bg-gray-50 disabled:cursor-not-allowed transition-all shadow-soft"
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
              <div className="mt-2 flex items-center text-sm text-[#64748B]">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#DBEAFE] border-t-[#2563EB] mr-2"></div>
                Loading topics...
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-[#334155] hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white px-4 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-medium hover:shadow-strong"
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
