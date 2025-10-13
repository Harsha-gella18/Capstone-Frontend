import React from 'react';

const Dashboard = ({ onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">EduBot Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome back!</span>
              <button 
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Welcome to Your Learning Dashboard!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            You've successfully logged in. Your AI-powered learning assistant is ready to help!
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-indigo-700">
                  <strong>Next Steps:</strong> This dashboard will be enhanced with chat functionality, learning analytics, and personalized recommendations.
                </p>
              </div>
            </div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-150 ease-in-out">
            Start Learning
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;