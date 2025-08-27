# Hospital Claims Management System - Frontend

A modern React TypeScript frontend for the Hospital Claims Management System, fully integrated with the Django REST API backend.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Claims Management**: Full CRUD operations for hospital insurance claims
- **User Management**: Admin interface for managing system users
- **Dashboard**: Real-time analytics and reporting
- **File Upload**: Support for document uploads (approval letters, POD, etc.)
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Type Safety**: Full TypeScript support

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Yup validation

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend Django server running (see backend README)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend_hospital/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Backend Integration

### API Endpoints

The frontend integrates with the following backend endpoints:

#### Authentication
- `POST /api/auth/login/` - User login
- `GET /api/auth/users/` - Get all users (admin only)
- `POST /api/auth/users/` - Create user (admin only)
- `PUT /api/auth/users/{id}/` - Update user (admin only)
- `DELETE /api/auth/users/{id}/` - Delete user (admin only)

#### Claims
- `GET /api/claims/` - Get claims with pagination and search
- `POST /api/claims/` - Create new claim
- `GET /api/claims/{id}/` - Get claim details
- `PUT /api/claims/{id}/` - Update claim
- `DELETE /api/claims/{id}/` - Delete claim
- `GET /api/claims/dashboard/summary/` - Dashboard statistics
- `GET /api/claims/dashboard/monthwise/` - Monthly chart data
- `GET /api/claims/dashboard/companywise/` - Company-wise chart data

### Authentication Flow

1. User enters credentials on login page
2. Frontend sends POST request to `/api/auth/login/`
3. Backend validates credentials and returns JWT tokens
4. Frontend stores tokens in localStorage
5. All subsequent API requests include Authorization header with Bearer token
6. Token refresh handled automatically by axios interceptors

### File Upload

Claims support file uploads for:
- Approval letters
- Physical files
- POD (Proof of Delivery)
- Query documents
- Query replies

Files are uploaded using FormData and multipart/form-data content type.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Claims/         # Claims-related components
│   ├── Common/         # Common components (Toast, etc.)
│   ├── Layout/         # Layout components (Header, Sidebar)
│   └── Users/          # User management components
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── main.tsx           # Application entry point
```

## Key Components

### AuthContext
Manages authentication state and provides login/logout functionality.

### API Services
- `authService.ts` - Authentication and user management
- `claimsService.ts` - Claims CRUD operations and dashboard data

### API Configuration
- `api.ts` - Axios instance with interceptors for authentication and error handling

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your web server

3. **Update environment variables** for production

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS settings include your frontend domain
2. **Authentication Issues**: Check JWT token expiration and refresh logic
3. **File Upload Failures**: Verify backend file upload configuration and permissions

### Debug Mode

Enable debug logging by setting `localStorage.debug = 'true'` in browser console.

## Contributing

1. Follow TypeScript best practices
2. Use proper error handling in API calls
3. Maintain consistent code formatting
4. Add proper TypeScript types for all components and functions

## License

This project is licensed under the MIT License.
