# Capstone Frontend - Educational Platform

A modern educational platform built with React and Vite, featuring AI-powered learning assistance, content management, and interactive user dashboards.

## Features

- 🔐 User Authentication (Signup/Login/OTP Verification)
- 👨‍🎓 Student Dashboard with AI Chat Assistant
- 👨‍💼 Admin Dashboard for Content Management
- 📚 Subject-based Learning Threads
- 🎨 Modern UI with Tailwind CSS and Three.js
- 🚀 Fast Development with Vite

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn package manager

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd capstonfrontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Then edit the `.env` file and replace the placeholder with your actual API Gateway URL:

```env
VITE_API_BASE_URL=https://your-api-id.execute-api.your-region.amazonaws.com
VITE_DEV_PROXY_PATH=/api
```

**Important:** Never commit your `.env` file to version control. It's already added to `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
capstonfrontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions and API calls
│   ├── assets/         # Static assets
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── public/             # Public static files
├── .env                # Environment variables (not in git)
├── .env.example        # Environment variables template
└── vite.config.js      # Vite configuration
```

## Environment Variables

This project uses environment variables to keep sensitive information secure:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | AWS API Gateway base URL |
| `VITE_DEV_PROXY_PATH` | Development proxy path (default: /api) |

## API Integration

The application integrates with AWS API Gateway for backend services. All API calls are configured in `src/utils/api.js` and use environment variables for the base URL.

### Development vs Production

- **Development**: Uses Vite's proxy to avoid CORS issues
- **Production**: Makes direct API calls to the configured endpoint

## Deployment

### Build for Production

```bash
npm run build
```

The build files will be generated in the `dist/` directory.

### Environment Variables for Deployment

Make sure to set the `VITE_API_BASE_URL` environment variable in your deployment platform (Vercel, Netlify, etc.).

## Security Notes

- ✅ API endpoints are stored in environment variables
- ✅ `.env` file is excluded from version control
- ✅ Authentication tokens are stored in localStorage
- ⚠️ Always use HTTPS in production
- ⚠️ Never commit sensitive credentials to Git

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **Framer Motion** - Animation library
- **React Markdown** - Markdown rendering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### CORS Errors
If you encounter CORS errors in development, ensure:
1. The development server is running (`npm run dev`)
2. The proxy configuration in `vite.config.js` is correct
3. Your `.env` file has the correct API URL

### Build Errors
If the build fails:
1. Check that all environment variables are set
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Clear Vite cache: `rm -rf node_modules/.vite`

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the GitHub repository.
