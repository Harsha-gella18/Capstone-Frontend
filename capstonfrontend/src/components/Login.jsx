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
    <div className="min-h-screen bg-gradient-to-br from-[#EDEEF3] via-[#F5F7FB] to-[#FFFBFE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
          {/* Left Side - Login Form */}
          <div className="p-12 lg:p-16 flex flex-col justify-center">
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
              <h2 className="text-4xl font-bold text-[#0F172A] mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-[#6B7280] font-medium text-lg">Access your learning dashboard</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#1F2937] mb-3">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gradient-to-br from-[#FAFBFC] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:border-[#7C3AED] transition duration-200 text-[#1F2937] placeholder-[#9CA3AF] font-medium shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between pt-2 mb-8">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-5 w-5 text-[#7C3AED] focus:ring-[#7C3AED] border-[#D1D5DB] rounded-lg cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm text-[#4B5563] font-medium cursor-pointer">
                Keep me signed in
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-[#7C3AED] hover:text-[#6D28D9] transition duration-200 font-semibold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 pt-8 border-t border-[#E5E7EB] text-center">
          <p className="text-[#6B7280] font-medium">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-[#7C3AED] hover:text-[#6D28D9] font-bold transition duration-200 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
          </div>

          {/* Right Side - Welcome Message with Gradient Background */}
          <div className="hidden lg:flex lg:flex-col lg:justify-between relative bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#5B21B6] p-16 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-[250px] -mt-[250px] blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full -ml-[200px] -mb-[200px] blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="mb-6 inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="text-sm font-semibold text-white/90">Premium Learning Experience</span>
              </div>
              <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight">Welcome Back to Your Learning</h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-lg font-medium">
                Continue your educational journey with personalized AI assistance, unlimited questions, and real-time learning insights.
              </p>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Instant Answers</h3>
                  <p className="text-white/70 text-sm">Get responses to any question in seconds</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">24/7 Support</h3>
                  <p className="text-white/70 text-sm">Learn anytime, anywhere at your own pace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;