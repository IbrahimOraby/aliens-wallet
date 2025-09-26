# Authentication System

This directory contains all authentication-related components and functionality for the application.

## Structure

```
src/
├── components/auth/
│   ├── AuthModal.tsx      # Main modal component that manages form switching
│   ├── LoginForm.tsx      # Login form with email/password + optional OTP
│   ├── SignupForm.tsx     # Signup form with name/email/password/phone/userType
│   ├── OTPForm.tsx        # OTP verification form for admin setup
│   ├── index.ts           # Barrel exports
│   └── README.md          # This file
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── types/
│   └── auth.ts            # TypeScript type definitions
├── schemas/
│   └── auth.ts            # Zod validation schemas
└── services/
    └── auth.ts            # API service functions (ready for backend integration)
```

## Features

### 🔐 **Login Form**
- Email and password validation
- Optional OTP field for admin users
- Password visibility toggle
- Form validation with error messages
- Loading states

### 📝 **Signup Form**
- Full name, email, password, phone number
- User type selection (ADMIN/CUSTOMER)
- Strong password validation
- Form validation with error messages
- Loading states

### 🔒 **OTP Verification**
- 6-digit OTP input
- Countdown timer (5 minutes)
- Resend OTP functionality
- QR code display for admin setup
- Different flows for admin vs customer

### 🎯 **User Flows**

#### Admin Flow:
1. Signup → QR Code → OTP Verification → Navigate to `/admin`
2. Login → OTP Verification → Navigate to `/admin`

#### Customer Flow:
1. Signup → Navigate to `/store`
2. Login → Navigate to `/store`

## Usage

### Basic Integration
```tsx
import { AuthProvider, AuthModal } from '@/components/auth';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
      <AuthModal />
    </AuthProvider>
  );
}
```

### Using Authentication Context
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    isAuthenticated, 
    user, 
    openAuthModal, 
    closeAuthModal 
  } = useAuth();

  return (
    <button onClick={() => openAuthModal('login')}>
      Sign In
    </button>
  );
}
```

## API Integration

The `AuthService` class in `src/services/auth.ts` is ready for backend integration. Simply replace the mock implementations with actual API calls:

```typescript
// Example API call
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData),
});
```

## Validation

All forms use Zod schemas for validation:
- Email format validation
- Password strength requirements
- Phone number format validation
- OTP format validation (6 digits)

## State Management

The authentication state is managed through React Context with useReducer:
- User information
- Authentication status
- Loading states
- Error handling
- Modal state management

## Future Enhancements

- [ ] Remember me functionality
- [ ] Social login integration
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management
- [ ] Role-based access control
