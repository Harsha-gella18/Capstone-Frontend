
import React, { useState, useEffect } from "react";
import LandingPage from './pages/landingpage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    console.log('App mounted - Checking auth status');
    console.log('Token exists:', !!token);
    console.log('UserData:', userData);
    
    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        console.log('Parsed user data:', parsedUserData);
        const role = parsedUserData.role || parsedUserData['custom:role'] || 'USER';
        console.log('Detected role:', role);
        setIsLoggedIn(true);
        setUserRole(role);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    console.log('handleAuthSuccess called');
    setIsLoggedIn(true);
    
    // Get user role from stored data
    const userData = localStorage.getItem('userData');
    console.log('UserData after login:', userData);
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        const role = parsedUserData.role || parsedUserData['custom:role'] || 'USER';
        console.log('Setting role to:', role);
        setUserRole(role);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    // Clear all authentication tokens and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  };

  return (
    <>
      {isLoggedIn ? (
        <>
          {console.log('Rendering dashboard - Role:', userRole)}
          {userRole === 'ADMIN' ? (
            <AdminDashboard onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          ) : (
            <UserDashboard onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          )}
        </>
      ) : (
        <LandingPage onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
}

export default App;
