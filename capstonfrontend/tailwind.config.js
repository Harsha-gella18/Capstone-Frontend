/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        // EdTech Professional Color System
        'edtech': {
          // Backgrounds
          'bg-main': '#F8FAFC',
          'bg-card': '#FFFFFF',
          'bg-sidebar': '#F1F5F9',
          
          // Primary (Actions & Focus)
          'primary': '#2563EB',
          'primary-dark': '#1E40AF',
          'primary-light': '#DBEAFE',
          
          // Text
          'heading': '#0F172A',
          'body': '#334155',
          'secondary': '#64748B',
          
          // Success
          'success': '#16A34A',
          'success-bg': '#DCFCE7',
          
          // Error
          'error': '#DC2626',
          'error-bg': '#FEE2E2',
          
          // Warning
          'warning': '#F59E0B',
          'warning-bg': '#FEF3C7',
          
          // Code blocks
          'code-bg': '#0F172A',
          'code-text': '#E5E7EB',
          'code-accent': '#38BDF8',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['Monaco', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'edtech': '0 2px 12px rgba(37, 99, 235, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      borderRadius: {
        'edtech': '12px',
      },
    },
  },
  plugins: [],
}

