import React, { useState, useEffect, useRef } from 'react';
import { verifyOTP } from '../utils/api';

const OTPVerification = ({ onVerifySuccess, onBack, email, phone, role, name, onResendOTP }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus on the last filled input
      const lastIndex = Math.min(index + pastedOtp.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      // Call the OTP verification API using the utility function
      console.log('Sending OTP verification with:', { email, otp: otpString });
      const data = await verifyOTP(email, otpString);

      console.log('OTP verification successful:', data);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        onVerifySuccess();
      }, 2000);
      
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call for resending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset timer and disable resend
      setResendTimer(60);
      setCanResend(false);
      
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      // Call the resend callback if provided
      if (onResendOTP) {
        onResendOTP();
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-200 p-10 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400"></div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 transition duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">EduBot</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
          <p className="text-gray-600 font-medium mb-4">
            We've sent a 6-digit verification code to:
          </p>
          <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <p className="text-sm font-bold text-gray-900">{email}</p>
            <p className="text-sm font-bold text-gray-900">{phone}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-green-600 font-bold text-sm">Email Verified Successfully!</p>
                <p className="text-green-600 text-xs mt-1">Redirecting to login page...</p>
              </div>
            </div>
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength="6"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-300 text-gray-900"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success || otp.join('').length !== 6}
            className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white py-4 px-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-2xl"
          >
            {success ? (
              <span>✓ Verified</span>
            ) : loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2 font-medium">Didn't receive the code?</p>
          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="text-gray-900 hover:text-black font-bold transition duration-300 disabled:opacity-50 underline underline-offset-2"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-sm text-gray-500 font-medium">
              Resend available in <span className="font-bold text-gray-900">{resendTimer}s</span>
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 font-medium">
            Having trouble? Contact support or try a different verification method.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;