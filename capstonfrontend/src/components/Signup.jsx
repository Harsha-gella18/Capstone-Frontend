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
    <div className="min-h-screen bg-gradient-to-br from-[#EDEEF3] via-[#F5F7FB] to-[#FFFBFE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
          {/* Left Side - Signup Form */}
          <div className="p-12 lg:p-16 flex flex-col justify-center max-h-screen lg:overflow-y-auto">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="self-start text-[#9CA3AF] hover:text-[#7C3AED] transition duration-300 mb-10 p-2 hover:bg-purple-50 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-[#0F172A] mb-3 tracking-tight">Create Account</h2>
              <p className="text-[#6B7280] font-medium text-lg">Join thousands of successful learners</p>
            </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-gradient-to-r from-[#FEE2E2] to-[#FEF2F2] border border-[#FECACA] rounded-2xl shadow-sm">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-[#DC2626] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-[#991B1B] text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#1F2937] mb-3">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gradient-to-br from-[#FAFBFC] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:border-[#7C3AED] transition duration-200 text-[#1F2937] placeholder-[#9CA3AF] font-medium shadow-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#1F2937] mb-3">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gradient-to-br from-[#FAFBFC] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:border-[#7C3AED] transition duration-200 text-[#1F2937] placeholder-[#9CA3AF] font-medium shadow-sm"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-[#1F2937] mb-3">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gradient-to-br from-[#FAFBFC] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:border-[#7C3AED] transition duration-200 text-[#1F2937] placeholder-[#9CA3AF] font-medium shadow-sm"
              placeholder="+911234567890"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="class" className="block text-sm font-semibold text-[#1F2937] mb-3">
                Class
              </label>
              <input
                id="class"
                name="class"
                type="text"
                value={formData.class}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-gradient-to-br from-[#FAFBFC] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:border-[#7C3AED] transition duration-200 text-[#1F2937] placeholder-[#9CA3AF] font-medium shadow-sm"
                placeholder="10"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-[#1F2937] mb-3">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-gradient-to-br from-[#FAFBFC] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:border-[#7C3AED] transition duration-200 text-[#1F2937] font-medium shadow-sm"
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#1F2937] mb-3">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gradient-to-br from-[#FAFBFC] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:border-[#7C3AED] transition duration-200 text-[#1F2937] placeholder-[#9CA3AF] font-medium shadow-sm"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#1F2937] mb-3">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gradient-to-br from-[#FAFBFC] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:border-[#7C3AED] transition duration-200 text-[#1F2937] placeholder-[#9CA3AF] font-medium shadow-sm"
              placeholder="Re-enter your password"
            />
          </div>

          <div className="flex items-start pt-2">
            <input
              id="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-5 w-5 text-[#7C3AED] focus:ring-[#7C3AED] border-[#D1D5DB] rounded-lg mt-0.5 flex-shrink-0 cursor-pointer"
            />
            <label htmlFor="acceptTerms" className="ml-3 text-sm text-[#4B5563] font-medium">
              I agree to the{' '}
              <button type="button" className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold hover:underline">
                Terms and Conditions
              </button>
              {' '}and{' '}
              <button type="button" className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold hover:underline">
                Privacy Policy
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl mt-6"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-[#E5E7EB]">
            <p className="text-[#6B7280] font-medium">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#7C3AED] hover:text-[#6D28D9] font-bold transition duration-200 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
          </div>

          {/* Right Side - Welcome Message with Gradient Background */}
          <div className="hidden lg:flex lg:flex-col lg:justify-between relative bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#5B21B6] p-16 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-[250px] -mt-[250px] blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full -ml-[200px] -mb-[200px] blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="mb-6 inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="text-sm font-semibold text-white/90">Start Your Journey Today</span>
              </div>
              <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight">Transform Your Learning</h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-lg font-medium">
                Join our community of learners and unlock unlimited access to AI-powered education with personalized lessons.
              </p>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Personalized Learning</h3>
                  <p className="text-white/70 text-sm">AI adapts to your learning pace</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Instant Support</h3>
                  <p className="text-white/70 text-sm">Get answers to any question instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;