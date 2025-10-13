import React, { useState } from 'react';
import OTPVerification from './OTPVerification';
import { signupUser } from '../utils/api';

const Signup = ({ onAuthSuccess, onBack, onSwitchToLogin }) => {
  const [showOTP, setShowOTP] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    class: '',
    role: 'STUDENT' // Default to STUDENT
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.class) {
      setError('Please fill in all fields');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number (e.g., +911234567890)');
      return false;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Call the signup API using the utility function
      const data = await signupUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        class: formData.class,
        role: formData.role
      });

      console.log('Signup successful:', data);
      
      // Show OTP verification page after successful registration
      setShowOTP(true);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerifySuccess = () => {
    // OTP verified successfully, redirect to login page
    console.log('OTP verified successfully, redirecting to login...');
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  const handleOTPBack = () => {
    // Go back to signup form
    setShowOTP(false);
  };

  const handleResendOTP = () => {
    // Resend OTP logic (in real app, make API call)
    console.log('Resending OTP to:', formData.email, formData.phone);
  };

  // If showing OTP verification, render OTP component
  if (showOTP) {
    return (
      <OTPVerification
        onVerifySuccess={handleOTPVerifySuccess}
        onBack={handleOTPBack}
        email={formData.email}
        phone={formData.phone}
        role={formData.role}
        name={formData.name}
        onResendOTP={handleResendOTP}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-noir-950 dark:via-noir-900 dark:to-noir-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-noir-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-10 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 dark:from-gray-600 dark:via-gray-400 dark:to-gray-600"></div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute top-6 left-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">EduBot</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Join thousands of learners already using EduBot</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-noir-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-noir-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-noir-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
              placeholder="+911234567890"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="class" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                Class
              </label>
              <input
                id="class"
                name="class"
                type="text"
                value={formData.class}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-noir-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                placeholder="10"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-noir-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition duration-300 text-gray-900 dark:text-white font-medium"
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-noir-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-noir-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
              placeholder="Re-enter your password"
            />
          </div>

          <div className="flex items-start">
            <input
              id="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-gray-900 dark:text-white focus:ring-gray-500 dark:focus:ring-gray-400 border-gray-300 dark:border-gray-600 rounded mt-1"
            />
            <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
              I agree to the{' '}
              <button type="button" className="text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-200 font-bold">
                Terms and Conditions
              </button>
              {' '}and{' '}
              <button type="button" className="text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-200 font-bold">
                Privacy Policy
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white dark:text-gray-900 py-4 px-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-2xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-gray-900 mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-200 font-bold transition duration-300 underline underline-offset-2"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;