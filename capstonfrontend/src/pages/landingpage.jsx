import React, { useState } from 'react';
import Login from '../components/Login';
import Signup from '../components/Signup';

const LandingPage = ({ onAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleShowSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const handleBack = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  if (showLogin) {
    return <Login onAuthSuccess={onAuthSuccess} onBack={handleBack} onSwitchToSignup={handleShowSignup} />;
  }

  if (showSignup) {
    return <Signup onAuthSuccess={onAuthSuccess} onBack={handleBack} onSwitchToLogin={handleShowLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 group">
                <h1 className="text-2xl font-heading font-bold text-[#0F172A] hover:scale-105 transition-transform duration-300">
                  EduBot
                </h1>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleShowLogin}
                className="text-[#334155] hover:text-[#0F172A] px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-gray-100"
              >
                Login
              </button>
              <button
                onClick={handleShowSignup}
                className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-medium shadow-soft"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8 inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] blur-3xl opacity-10 rounded-full"></div>
              <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-heading font-black text-[#0F172A] leading-tight tracking-tight">
                Transform Your Learning
                <span className="block mt-2 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] bg-clip-text text-transparent">
                  with AI Intelligence
                </span>
              </h1>
            </div>
          </div>
          <p className="mt-8 text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed font-medium">
            Experience personalized education powered by advanced AI. Get instant answers, 
            adaptive learning paths, and 24/7 academic support in an elegantly designed platform.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={handleShowSignup}
              className="group relative bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-strong transition-all duration-300 hover:shadow-medium hover:-translate-y-1"
            >
              <span className="relative z-10">Get Started Free</span>
            </button>
            <button
              onClick={handleShowLogin}
              className="bg-transparent border-2 border-[#2563EB] text-[#2563EB] px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 hover:bg-[#DBEAFE] hover:-translate-y-1"
            >
              Already have an account?
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-black text-[#0F172A] mb-4">
              Why Choose EduBot?
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="group relative bg-white p-10 rounded-2xl shadow-soft hover:shadow-strong transition-all duration-300 border border-gray-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#DBEAFE] to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-xl flex items-center justify-center mb-8 shadow-medium group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-bold text-[#0F172A] mb-4">Instant Answers</h3>
                <p className="text-[#64748B] leading-relaxed">
                  Get immediate responses to your questions across all subjects. No more waiting for office hours or struggling alone.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white p-10 rounded-2xl shadow-soft hover:shadow-strong transition-all duration-300 border border-gray-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#DBEAFE] to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-xl flex items-center justify-center mb-8 shadow-medium group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-bold text-[#0F172A] mb-4">Personalized Learning</h3>
                <p className="text-[#64748B] leading-relaxed">
                  Adaptive learning paths that adjust to your pace and learning style. Every interaction makes your experience more tailored.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white p-10 rounded-2xl shadow-soft hover:shadow-strong transition-all duration-300 border border-gray-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#DBEAFE] to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-xl flex items-center justify-center mb-8 shadow-medium group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-bold text-[#0F172A] mb-4">24/7 Availability</h3>
                <p className="text-[#64748B] leading-relaxed">
                  Learn on your schedule. Whether it's midnight or dawn, your AI tutor is always ready to help you succeed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 relative overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-3xl p-16 text-center shadow-strong">
          <div className="relative">
            <h2 className="text-4xl font-heading font-black mb-6 text-white">
              Ready to revolutionize your learning?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are already learning smarter, not harder.
            </p>
            <button
              onClick={handleShowSignup}
              className="bg-white text-[#2563EB] px-12 py-5 rounded-2xl text-lg font-bold hover:-translate-y-1 transition-all duration-300 shadow-medium hover:shadow-strong"
            >
              Start Learning Today
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-16 mt-32 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-heading font-black mb-4 bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent">
            EduBot
          </h3>
          <p className="text-gray-400 text-lg font-medium">
            Empowering education through intelligent conversation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;