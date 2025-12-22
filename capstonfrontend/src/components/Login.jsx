import React, { useState } from 'react';
import { loginUser } from '../utils/api';

const Login = ({ onAuthSuccess, onBack, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Call the login API using the utility function
      const data = await loginUser({
        email: formData.email,
        password: formData.password
      });

      console.log('Login successful:', data);
      
      // Store the id_token (used for authorization)
      const token = data.id_token || data.idToken || data.token || data.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
        console.log('Token stored successfully');
        
        // Decode JWT to extract user information
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('Decoded token payload:', payload);
            
            // Extract user data from token
            const userData = {
              email: payload.email || formData.email,
              name: payload.name || '',
              role: payload['custom:role'] || payload.role || 'STUDENT',
              phone: payload.phone_number || '',
              sub: payload.sub,
              username: payload['cognito:username'] || ''
            };
            
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('Stored user data:', userData);
            console.log('User role:', userData.role);
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          // Store minimal user data if decode fails
          const userData = {
            email: formData.email,
            name: '',
            role: 'STUDENT'
          };
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } else {
        console.error('No token found in response');
      }
      
      // Store access_token and refresh_token if provided
      if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token);
      }
      
      // Also store if user data is directly provided
      if (data.user) {
        const existingData = JSON.parse(localStorage.getItem('userData') || '{}');
        localStorage.setItem('userData', JSON.stringify({ ...existingData, ...data.user }));
      }
      
      onAuthSuccess();
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide specific error messages based on the error
      if (err.message.includes('403')) {
        setError('Access denied. Please check your credentials or contact support if this persists.');
      } else if (err.message.includes('401')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('404')) {
        setError('Login service not found. Please try again later.');
      } else if (err.message.includes('500')) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-strong border border-gray-200 p-10 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2563EB] to-[#1E40AF]"></div>
        
        {/* Header */}
        <div className="text-center mb-10">
          <button
            onClick={onBack}
            className="absolute top-6 left-6 text-[#64748B] hover:text-[#0F172A] transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-4xl font-heading font-black text-[#0F172A] mb-3 tracking-tight">EduBot</h1>
          <h2 className="text-2xl font-heading font-bold text-[#0F172A] mb-2">Welcome Back!</h2>
          <p className="text-[#64748B] font-medium">Sign in to continue your learning journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#FEE2E2] border-l-4 border-[#DC2626] rounded-xl">
            <p className="text-[#DC2626] text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#0F172A] mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#2563EB] transition duration-200 text-[#334155] placeholder-[#64748B] font-medium"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#0F172A] mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#2563EB] transition duration-200 text-[#334155] placeholder-[#64748B] font-medium"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#2563EB] focus:ring-[#2563EB] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[#334155] font-medium">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-[#2563EB] hover:text-[#1E40AF] transition duration-200 font-semibold"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2563EB] to-[#1E40AF] hover:shadow-strong disabled:opacity-50 text-white py-4 px-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-10 text-center">
          <p className="text-[#64748B] font-medium">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-[#2563EB] hover:text-[#1E40AF] font-bold transition duration-200 underline underline-offset-2"
            >
              Sign up now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;