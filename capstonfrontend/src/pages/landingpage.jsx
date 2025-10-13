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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-noir-950 dark:via-noir-900 dark:to-noir-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-noir-950/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 group">
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                  EduBot
                </h1>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleShowLogin}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Login
              </button>
              <button
                onClick={handleShowSignup}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
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
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-400 blur-3xl opacity-20 rounded-full"></div>
              <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Transform Your Learning
                <span className="block mt-2 bg-gradient-to-r from-gray-700 via-gray-900 to-black dark:from-gray-300 dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                  with AI Intelligence
                </span>
              </h1>
            </div>
          </div>
          <p className="mt-8 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Experience personalized education powered by advanced AI. Get instant answers, 
            adaptive learning paths, and 24/7 academic support in an elegantly designed platform.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={handleShowSignup}
              className="group relative bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl overflow-hidden"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
            <button
              onClick={handleShowLogin}
              className="bg-transparent border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 hover:scale-105"
            >
              Already have an account?
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              Why Choose EduBot?
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-400 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="group relative bg-white dark:bg-noir-900 p-10 rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 border border-gray-200 dark:border-gray-800 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-800 dark:to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Instant Answers</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get immediate responses to your questions across all subjects. No more waiting for office hours or struggling alone.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white dark:bg-noir-900 p-10 rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 border border-gray-200 dark:border-gray-800 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-800 dark:to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Personalized Learning</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Adaptive learning paths that adjust to your pace and learning style. Every interaction makes your experience more tailored.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white dark:bg-noir-900 p-10 rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 border border-gray-200 dark:border-gray-800 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-800 dark:to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">24/7 Availability</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Learn on your schedule. Whether it's midnight or dawn, your AI tutor is always ready to help you succeed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-100 rounded-3xl p-16 text-center shadow-3xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent dark:via-black animate-shimmer"></div>
          </div>
          <div className="relative">
            <h2 className="text-4xl font-black mb-6 text-white dark:text-gray-900">
              Ready to revolutionize your learning?
            </h2>
            <p className="text-xl text-gray-300 dark:text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are already learning smarter, not harder.
            </p>
            <button
              onClick={handleShowSignup}
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-12 py-5 rounded-2xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
            >
              Start Learning Today
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white dark:text-gray-100 py-16 mt-32 border-t border-gray-800 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-gray-300 to-white dark:from-gray-600 dark:to-gray-400 bg-clip-text text-transparent">
            EduBot
          </h3>
          <p className="text-gray-400 dark:text-gray-600 text-lg font-medium">
            Empowering education through intelligent conversation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;