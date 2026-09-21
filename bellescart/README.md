# BellesCart Frontend

BellesCart is the customer-facing Next.js frontend for the Belles Avenue e-commerce platform. It provides a modern, responsive shopping experience with comprehensive e-commerce features and admin portal functionality.

## Tech Stack

- **Next.js 16.2.2**: React framework with App Router
- **React 19.2.4**: Latest React with new features
- **TypeScript**: Full type safety
- **Tailwind CSS 4**: Utility-first CSS framework
- **TanStack Query**: Advanced data fetching and caching
- **Axios**: HTTP client with interceptor pattern
- **Sentry**: Error tracking and monitoring
- **Razorpay**: Payment integration
- **crypto-browserify**: Client-side cryptography for request signing

## Features

### Customer-Facing Features

- **Home Page**: Hero section, featured products, categories, trust indicators
- **Product Discovery**: Search, filtering, category browsing, featured products
- **Product Details**: Image gallery, variants, reviews, related products
- **Shopping Cart**: Item management, quantity adjustment, order summary
- **Checkout**: Address forms, payment integration, order review
- **Authentication**: Email/password signup, OTP verification, login, logout
- **Order Management**: Order history, order details, order tracking
- **Wishlist**: Save and manage favorite products
- **User Profile**: Account settings, personal information management
- **Wallet**: Digital wallet for payments
- **Coupons**: Apply and manage discount codes
- **Product Reviews**: Submit and read product reviews
- **Privacy Center**: GDPR compliance features, data export, privacy preferences
- **Theme System**: Light/dark/auto theme switching
- **Responsive Design**: Mobile-first responsive UI

### Admin Portal (`/belles-portel-25`)

- **Admin Authentication**: Separate admin login system
- **Dashboard**: Analytics and statistics overview
- **Product Management**: CRUD operations with image uploads
- **Category Management**: Category organization and management
- **Order Management**: Order processing and status updates
- **User Management**: User administration
- **Coupon Management**: Discount code creation and management
- **Review Management**: Content moderation for product reviews
- **Privacy Requests**: Handle user data privacy requests

## Architecture

### Directory Structure

```
bellescart/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── products/            # Product pages
│   ├── product/             # Product details
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   ├── orders/              # Order management
│   ├── wishlist/            # Wishlist management
│   ├── profile/             # User profile
│   ├── wallet/              # Digital wallet
│   ├── login/               # Authentication
│   ├── signup/              # Registration
│   ├── verify-otp/          # OTP verification
│   ├── belles-portel-25/    # Admin portal
│   └── layout.tsx           # Root layout
├── components/              # Reusable React components
│   ├── Navbar/              # Navigation component
│   ├── Footer/              # Footer component
│   ├── ProductCard/         # Product display cards
│   ├── ProductGrid/         # Product grid layouts
│   ├── CartItem/            # Cart item components
│   ├── OrderCard/           # Order display cards
│   ├── ui/                  # UI components (Button, Input, etc.)
│   └── reviews/             # Review components
├── services/                # API service layer
│   ├── apiInterceptor.ts    # Customer API interceptor
│   ├── admin/               # Admin-specific services
│   │   └── apiInterceptor.ts # Admin API interceptor
│   ├── authService.ts       # Authentication service
│   ├── cartService.ts       # Cart operations
│   ├── orderService.ts      # Order operations
│   └── ...                  # Other service files
├── hooks/                   # React Query hooks
│   ├── user/                # Customer hooks
│   └── admin/               # Admin hooks
├── auth/                    # Authentication logic
│   ├── user/                # Customer authentication
│   └── admin/               # Admin authentication
├── contexts/                # React contexts
│   ├── ThemeContext.tsx     # Theme management
│   ├── ToastContext.tsx     # Toast notifications
│   └── LanguageContext.tsx  # Language preferences
├── providers/               # React providers
│   ├── QueryProvider.tsx     # TanStack Query setup
│   ├── CsrfProvider.tsx      # CSRF token management
│   ├── UserPreferencesProvider.tsx # User preferences
│   └── AdminThemeProvider.tsx # Admin theme provider
├── utils/                   # Utility functions
│   ├── requestSigning.ts    # HMAC signature generation
│   ├── globalToast.ts       # Toast utilities
│   └── types.ts             # TypeScript types
├── config/                  # Configuration
│   └── appConfig.ts         # Application configuration
└── sentry.*.config.ts       # Sentry error tracking
```

### State Management

**TanStack Query**: Server state and API data fetching
- Caches API responses
- Automatic refetching
- Loading and error states
- Optimistic updates

**React Context**: Global application concerns
- Theme management (light/dark/auto)
- Toast notifications
- User preferences
- Language settings

**Component State**: Local UI state
- Form inputs
- UI toggles
- Component-specific state

## API Architecture

### Customer API Interceptor (`services/apiInterceptor.ts`)

The customer API interceptor handles all customer-facing API communication:

- **JWT Authentication**: Automatic token attachment and refresh
- **Token Refresh**: Proactive token refresh when access token expires
- **CSRF Protection**: Double-submit cookie pattern with fallback mechanisms
- **Request Signing**: HMAC-SHA256 signatures for sensitive endpoints
- **Request Deduplication**: Prevents duplicate simultaneous GET requests
- **Error Handling**: Comprehensive error handling with toast notifications

### Admin API Interceptor (`services/admin/apiInterceptor.ts`)

Separate interceptor for admin operations:

- **Admin Authentication**: Admin-specific JWT handling
- **Token Validation**: Client-side token expiration checking
- **CSRF Protection**: Admin CSRF token management
- **Request Signing**: Admin-specific request signing for sensitive operations
- **Error Handling**: Admin-specific error handling and redirects

### Request Signing

The application uses HMAC-SHA256 request signing for sensitive operations:

- **Sensitive Endpoints**: Orders, payments, wallet operations, admin endpoints
- **Signature Components**: Payload + timestamp + nonce
- **Validation**: Server-side signature verification
- **Replay Protection**: Nonce-based replay attack prevention

## Security

### Authentication

- **JWT-based Authentication**: Access and refresh token system
- **Token Storage**: localStorage for tokens (separate for user and admin)
- **Token Refresh**: Automatic refresh when access token expires
- **Session Management**: Proper session cleanup on logout
- **Role-based Access**: Separate user and admin authentication systems

### CSRF Protection

- **Double-submit Cookie Pattern**: CSRF token in cookie and header
- **Token Generation**: Server-side token generation
- **Token Validation**: Server-side token validation for state-changing operations
- **Fallback Mechanisms**: localStorage fallback for development
- **Excluded Endpoints**: Public endpoints don't require CSRF

### Request Signing

- **HMAC-SHA256**: Cryptographic signature for sensitive operations
- **Timestamp Validation**: 5-minute timestamp window
- **Nonce Management**: Replay attack prevention
- **Sensitive Endpoint Detection**: Automatic detection of high-risk operations

### Input Validation

- **Client-side Validation**: Form validation before API calls
- **Type Safety**: TypeScript for compile-time type checking
- **API Response Validation**: Response data validation

## Sentry Integration

### Error Tracking

- **Client-side Monitoring**: Browser error tracking
- **Server-side Monitoring**: Next.js server error tracking
- **Error Filtering**: Filters expected errors (401, 404, validation, rate limits)
- **Sensitive Data Filtering**: Removes headers, cookies, and sensitive data from breadcrumbs

### Configuration

- **Environment Variables**: `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- **Sample Rates**: Configurable error and performance sampling
- **Source Maps**: Configured for production builds
- **Environment Separation**: Separate tracking for development and production

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `SENTRY_DSN` | Sentry Data Source Name for error tracking | Optional |
| `SENTRY_RELEASE` | Release version for Sentry | Optional |
| `APP_VERSION` | Application version | Optional |
| `SENTRY_ORG` | Sentry organization slug | Optional |
| `SENTRY_PROJECT` | Sentry project slug | Optional |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source map uploads | Optional |
| `BACKEND_API_URL` | Backend API base URL | Optional (defaults to http://127.0.0.1:5000/api) |
| `ENABLE_MOCK_DATA` | Enable mock data mode | Optional |
| `ENABLE_LOGGING` | Enable console logging | Optional |
| `REQUEST_SIGNING_SECRET` | Request signing secret | Optional |

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on port 5000

### Installation

```bash
# Install dependencies
npm install
```

### Running the Development Server

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Backend Connection

The frontend connects to the backend via:
- **API Proxy**: Next.js rewrites `/api/*` to `http://127.0.0.1:5000/api/*`
- **Direct API Calls**: Fallback to direct API calls for certain operations
- **CORS**: Configured to allow requests from localhost:3000

## Build and Production

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

The production build includes:
- Optimized JavaScript bundles
- Image optimization
- Sentry source map uploads (if configured)
- Environment-specific configurations

## Development Guidelines

### Architecture Principles

- **Follow Existing Patterns**: Use existing service and interceptor patterns
- **Separate Concerns**: Keep UI logic separate from business logic
- **Type Safety**: Use TypeScript types for all data structures
- **Error Handling**: Implement proper error handling for all API calls
- **Security**: Never disable security middleware or bypass authentication

### API Integration

- **Use Existing Interceptors**: Use `apiFetch` for customer APIs, `adminApiFetch` for admin APIs
- **Handle Errors**: Implement proper error handling with user feedback
- **Loading States**: Show loading indicators during API calls
- **Data Validation**: Validate API responses before using data

### Component Development

- **Reusable Components**: Create reusable UI components in `components/ui/`
- **Consistent Styling**: Use Tailwind CSS for consistent styling
- **Responsive Design**: Ensure components work on mobile and desktop
- **Accessibility**: Implement proper ARIA labels and keyboard navigation

### Security Guidelines

- **Never Commit Secrets**: Never commit `.env` files or secrets
- **Use Environment Variables**: Use environment variables for configuration
- **Validate Input**: Validate all user inputs before API calls
- **Secure Storage**: Use proper token storage and management
- **CSRF Protection**: Always include CSRF tokens for state-changing operations
- **Request Signing**: Use request signing for sensitive operations

## Project Architecture Overview

```
Next.js Frontend (port 3000)
    ↓
API Interceptors (Customer/Admin)
    ↓
Backend API (port 5000)
    ↓
Controllers → Interactors → Repositories → MongoDB
    ↓
External Integrations:
- Razorpay (Payments)
- NimbusPost (Shipping)
- Cloudinary/AWS S3 (Storage)
- Nodemailer (Email)
- Sentry (Error Tracking)
```

## Support

For support and questions, please contact the BellesCart team at support@bellescart.com.