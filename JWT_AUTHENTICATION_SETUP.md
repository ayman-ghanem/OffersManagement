# JWT Authentication Setup

This document explains how to configure and use the JWT-based authentication system in your Offers Management application.

## Overview

The application now uses a complete JWT authentication system that:
- Authenticates users via external API
- Stores JWT tokens securely
- Automatically attaches tokens to API requests
- Handles token expiration and refresh
- Provides centralized authentication state management

## API Requirements

Your external API should implement the following endpoints:

### Login Endpoint
- **URL**: `POST /api/admin/OffersManagement/login`
- **Headers**: 
  - `accept: */*`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "userName": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "string",
    "expiresAtUtc": "2024-01-01T12:00:00Z"
  }
  ```

**Note**: No token refresh endpoint is needed. The access token will be used until it expires.

## Configuration

### 1. Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=http://localhost:5159/api
```

**Note**: Since this is a Vite project, use `VITE_` prefix instead of `REACT_APP_` for environment variables.

### 2. Update API Configuration

Edit `src/config/api.js` to match your API endpoints:

```javascript
const config = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5159/api',
    endpoints: {
        auth: {
            login: '/admin/OffersManagement/login'
        },
        // Add your other endpoints here
    }
};
```

## Usage

### 1. Authentication Context

The app is wrapped with `AuthProvider` which provides authentication state throughout the application:

```jsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
    const { isAuthenticated, user, login, logout, loading } = useAuth();
    
    // Use authentication state and methods
}
```

### 2. Making API Calls

Use the `apiService` for authenticated API calls:

```javascript
import apiService from './services/apiService';

// GET request
const data = await apiService.get('/offers');

// POST request
const result = await apiService.post('/offers', offerData);

// PUT request
const updated = await apiService.put('/offers/123', updateData);

// DELETE request
await apiService.delete('/offers/123');
```

### 3. Direct Auth Service Access

For direct authentication operations:

```javascript
import authService from './services/authService';

// Check if user is authenticated
const isAuth = authService.isAuthenticated();

// Get current token
const token = authService.getToken();

// Get user data
const user = authService.getUserData();

// Logout
authService.logout();
```

## File Structure

```
src/
├── contexts/
│   └── AuthContext.jsx          # Authentication context provider
├── services/
│   ├── authService.js           # JWT token management
│   └── apiService.js            # Authenticated API calls
├── config/
│   └── api.js                   # API configuration
└── components/
    ├── MainApp.tsx              # Updated to use auth context
    └── AdminLogin.tsx           # Updated to use external API
```

## Security Features

1. **Token Storage**: JWT tokens are stored in localStorage with expiration checking
2. **Automatic Token Attachment**: All API calls automatically include the Bearer token
3. **Token Expiration Handling**: Automatic logout when tokens expire
4. **Error Handling**: Comprehensive error handling for authentication failures
5. **Loading States**: Proper loading states during authentication operations

## Error Handling

The system handles various error scenarios:

- Invalid credentials
- Network errors
- Token expiration
- API server errors
- Malformed responses

All errors are properly displayed to the user with appropriate messages.

## Testing

To test the authentication system:

1. Start your development server
2. Try logging in with invalid credentials (should show error)
3. Try logging in with valid credentials (should redirect to admin panel)
4. Check browser localStorage for stored tokens
5. Test token expiration by manually setting an expired date in localStorage

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API server allows CORS requests from your frontend domain
2. **Token Not Attached**: Check that the API base URL is correctly configured
3. **Immediate Logout**: Verify that your API returns the correct response format
4. **Network Errors**: Check that the API server is running and accessible

### Debug Mode

Enable debug logging by adding this to your browser console:

```javascript
localStorage.setItem('debug', 'true');
```

This will show detailed authentication logs in the console.

## Migration from Mock Authentication

The system has been updated to use external API authentication instead of mock credentials. The old mock authentication has been completely removed and replaced with the JWT-based system.

## Next Steps

1. Configure your API endpoints in `src/config/api.js`
2. Set up your environment variables
3. Test the authentication flow
4. Implement additional API endpoints as needed
5. Add token refresh functionality if your API supports it
