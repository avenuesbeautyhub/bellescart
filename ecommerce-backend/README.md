# BellesCart E-commerce Backend

A comprehensive, scalable e-commerce backend built with Node.js, Express, TypeScript, and MongoDB, following clean architecture principles with interactors, repositories, and dependency injection.

## Tech Stack

- **Node.js/Express**: Web framework and server
- **TypeScript**: Full type safety and better development experience
- **MongoDB/Mongoose**: NoSQL database with ODM
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing
- **Razorpay**: Payment gateway integration
- **NimbusPost**: Shipping and logistics integration
- **Cloudinary**: Image storage and processing
- **AWS S3**: Alternative cloud storage (optional)
- **Nodemailer**: Email services
- **Winston**: Structured logging
- **Sentry**: Error monitoring and tracking
- **Helmet**: Security headers
- **Rate Limiting**: API abuse prevention
- **Swagger UI**: Interactive API documentation

**Note**: Passport and Passport Google OAuth are included in dependencies but not currently implemented in the codebase.

## Features

### Core E-commerce Functionality

- **User Management**: Registration, OTP verification, authentication, profile management, wishlist
- **Product Catalog**: Product CRUD, categories, search, filtering, inventory management
- **Shopping Cart**: Add/remove items, quantity management, coupon support
- **Order Management**: Order processing, status tracking, payment integration
- **Shipping Integration**: NimbusPost API integration for shipping rates, courier assignment, and order tracking
- **Admin Features**: Product management, order management, user management, analytics dashboard
- **Reviews**: Product reviews with verified purchase badges
- **Coupons**: Discount code management and validation
- **Wallet**: Digital wallet for customer payments
- **Privacy**: GDPR compliance features, data export, privacy preferences
- **Notifications**: Email notifications for orders and account activities

### Technical Features

- **Clean Architecture**: Separation of concerns with Controllers, Interactors, and Repositories
- **Dependency Injection**: Interface-based dependency injection with providers
- **TypeScript**: Full type safety with interfaces and generics
- **MongoDB**: Scalable NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **API Documentation**: Swagger UI for interactive API documentation
- **Security**: CSRF protection, request signing, rate limiting, CORS, Helmet
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Logging**: Winston-based structured logging with request IDs
- **Monitoring**: Sentry integration for error tracking and performance monitoring

## Architecture

### Directory Structure

```
ecommerce-backend/
src/
├── config/              # Configuration files
│   ├── database.ts      # MongoDB connection configuration
│   ├── cors_config.ts   # CORS configuration
│   ├── swagger.ts       # Swagger API documentation setup
│   ├── cloudinary.ts    # Cloudinary configuration
│   └── sentry.ts        # Sentry error tracking setup
├── controllers/         # Request handlers and response formatting
│   ├── authController.ts
│   ├── productController.ts
│   ├── cartController.ts
│   ├── orderController.ts
│   ├── adminController.ts
│   ├── profileController.ts
│   ├── reviewController.ts
│   ├── walletController.ts
│   ├── couponController.ts
│   ├── privacyController.ts
│   └── ...
├── interactors/         # Business logic layer (services)
│   ├── UserInteractor.ts
│   ├── ProductInteractor.ts
│   ├── CartInteractor.ts
│   ├── OrderInteractor.ts
│   ├── AdminInteractor.ts
│   ├── CategoryInteractor.ts
│   ├── CouponInteractor.ts
│   ├── ReviewInteractor.ts
│   ├── WalletInteractor.ts
│   ├── PrivacyInteractor.ts
│   └── UserPreferencesInteractor.ts
├── repositories/        # Data access layer (Repository pattern)
│   ├── BaseRepository.ts
│   ├── UserRepository.ts
│   ├── ProductRepository.ts
│   ├── CartRepository.ts
│   ├── OrderRepository.ts
│   ├── CategoryRepository.ts
│   ├── CouponRepository.ts
│   ├── WalletRepository.ts
│   ├── PrivacyPreferenceRepository.ts
│   ├── PrivacyRequestRepository.ts
│   └── ...
├── models/             # Database models and schemas
│   ├── User.ts
│   ├── Admin.ts
│   ├── Product.ts
│   ├── Category.ts
│   ├── Cart.ts
│   ├── Order.ts
│   ├── Payment.ts
│   ├── Wallet.ts
│   ├── Coupon.ts
│   ├── Review.ts
│   ├── PrivacyPreference.ts
│   ├── PrivacyRequest.ts
│   ├── Otp.ts
│   └── index.ts
├── middleware/          # Custom middleware
│   ├── auth.ts          # JWT authentication
│   ├── csrf.ts          # CSRF protection
│   ├── requestSigning.ts # HMAC request signing
│   ├── errorHandler.ts  # Centralized error handling
│   ├── rateLimiter.ts   # API rate limiting
│   └── requestId.ts     # Request ID generation
├── routes/             # API route definitions
│   ├── index.ts         # Main route aggregator
│   ├── authRoutes.ts
│   ├── products.ts
│   ├── cartRoutes.ts
│   ├── orders.ts
│   ├── adminRoutes.ts
│   ├── categories.ts
│   ├── publicRoutes.ts
│   ├── paymentRoutes.ts
│   ├── profileRoutes.ts
│   ├── userRoutes.ts
│   ├── walletRoutes.ts
│   ├── userPreferencesRoutes.ts
│   ├── privacyRoutes.ts
│   ├── adminPrivacyRoutes.ts
│   ├── reviewRoutes.ts
│   └── adminReviewRoutes.ts
├── providers/          # Dependency injection interfaces
│   └── interfaces/     # Repository and interactor interfaces
├── services/           # External service integrations
│   ├── nimbusPost.service.ts
│   ├── paymentService.ts
│   └── cloudinaryService.ts
├── utils/              # Utility functions
│   ├── jwt.ts          # JWT token generation/validation
│   ├── logger.ts       # Winston logging setup
│   └── validation.ts   # Input validation utilities
├── app.ts              # Express app configuration
└── server.ts           # Server entry point
```

### Architecture Pattern

The backend follows a layered architecture with dependency injection:

```
HTTP Request
    ↓
Routes (API endpoints)
    ↓
Controllers (Request/Response handling)
    ↓
Interactors (Business logic)
    ↓
Repositories (Data access)
    ↓
Models (Database schemas)
    ↓
MongoDB
```

### Dependency Injection

The backend uses interface-based dependency injection:
- **Providers**: Interface definitions for repositories and interactors
- **Interactors**: Business logic depends on repository interfaces
- **Repositories**: Data access depends on MongoDB models
- **Loose Coupling**: Easy to swap implementations

## API Routes

### Major Route Groups

- **`/api/auth`**: User authentication (register, login, OTP verification, refresh token)
- **`/api/public`**: Public endpoints (products, categories, reviews) - no authentication required
- **`/api/products`**: Product management (authenticated)
- **`/api/cart`**: Shopping cart operations (authenticated)
- **`/api/orders`**: Order management and tracking (authenticated)
- **`/api/payment`**: Payment processing (authenticated)
- **`/api/profile`**: User profile management (authenticated)
- **`/api/wallet`**: Digital wallet operations (authenticated)
- **`/api/user`**: User-specific operations (coupons, etc.)
- **`/api/preferences`**: User preferences management (authenticated)
- **`/api/privacy`**: Privacy and GDPR compliance (authenticated)
- **`/api/reviews`**: Product reviews (public and authenticated)
- **`/api/admin`**: Admin operations (admin authentication required)
- **`/api/admin/privacy`**: Admin privacy request management
- **`/api/admin/reviews`**: Admin review moderation

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## Authentication

### User Authentication Flow

1. **Registration**: User provides email, password, phone, and consent information
2. **OTP Verification**: User receives OTP via email and verifies account
3. **Login**: User provides credentials, receives access and refresh tokens
4. **Token Refresh**: Access token refresh using refresh token
5. **Logout**: Token invalidation and session cleanup

### Admin Authentication

Separate admin authentication system:
- **Admin Registration**: Admin account creation
- **Admin Login**: Admin-specific authentication endpoint
- **Admin JWT**: Separate JWT tokens for admin operations
- **Role-based Access**: Admin-specific endpoints and permissions

### JWT Configuration

- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for token refresh
- **Token Storage**: Client-side storage (handled by frontend)
- **Token Validation**: Server-side verification with expiration checking

## Security

### CSRF Protection

- **Double-submit Cookie Pattern**: CSRF token in cookie and header
- **Token Generation**: Server-side token generation endpoint
- **Token Validation**: Middleware validates CSRF tokens for state-changing operations
- **Excluded Endpoints**: Public endpoints, authentication endpoints don't require CSRF
- **Development Fallback**: Development mode fallback for local testing

### Request Signing

- **HMAC-SHA256**: Cryptographic signature for sensitive operations
- **Timestamp Validation**: 5-minute timestamp window
- **Nonce Management**: Replay attack prevention with nonce storage
- **Sensitive Endpoints**: Orders, payments, wallet operations, admin endpoints
- **Signature Components**: Payload + timestamp + nonce + shared secret

### Rate Limiting

Multiple rate limiting categories:

| Category | Window | Limit | Purpose |
|----------|--------|-------|---------|
| General API | 15 minutes | 100 (dev: 1000) | Standard API calls |
| Public Endpoints | 15 minutes | 500 (dev: 2000) | Products, categories |
| Authentication | 10 minutes | 7 | Login/register attempts |
| Order Creation | 1 hour | 10 | Prevent spam orders |
| Payment Processing | 15 minutes | 10 | Payment attempts |
| Shipping Calculation | 1 minute | 20 | Shipping rate requests |
| Admin Operations | 15 minutes | 500 | Admin API calls |
| Privacy Operations | 1 hour | 5 | Privacy requests |

### Other Security Features

- **Helmet**: Security headers (CSP, XSS protection, etc.)
- **CORS**: Configured cross-origin resource sharing
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Request validation and sanitization
- **Request ID**: Unique request tracking
- **Error Handling**: Centralized error handling without sensitive data exposure

## Database Schema

### User Model

- Basic user information (name, email, phone)
- Authentication credentials (hashed password)
- Role-based access control (user/admin)
- Wishlist functionality
- Address management
- Privacy consent tracking (GDPR compliance)
- Marketing consent management

### Product Model

- Product details and descriptions
- Category relationships
- Inventory management (quantity, status)
- Image management (multiple images with main image flag)
- Pricing and shipping information
- Tags and search indexing
- Featured product flag

### Order Model

- Order items and quantities
- Shipping and billing addresses
- Payment information and status
- Order status workflow (pending → delivered)
- Coupon support
- NimbusPost integration fields (shipment ID, tracking, courier)
- Return management
- Order number generation

### Additional Models

- **Category**: Product categorization
- **Cart**: Shopping cart management
- **Payment**: Payment transaction records
- **Wallet**: Digital wallet balance and transactions
- **Coupon**: Discount code management
- **Review**: Product reviews with verified purchase badges
- **PrivacyPreference**: User privacy settings
- **PrivacyRequest**: Data export and deletion requests
- **Otp**: OTP verification records
- **Admin**: Admin user management

## Integrations

### NimbusPost Shipping

Comprehensive shipping integration:
- **Authentication**: API key-based authentication
- **Shipping Rate Calculation**: Real-time courier rates and delivery estimates
- **Order Creation**: Automatic shipment creation after payment
- **Courier Assignment**: Multiple courier options with selection
- **Order Tracking**: Real-time shipment tracking
- **Address Management**: Pickup and return address configuration
- **Label Generation**: Shipping label generation
- **Manifest Generation**: Batch shipment processing

**Pickup Location**: Belles Avenue Fashion Hub, Post Office Junction, Pincode: 691305

**Setup**: See `NIMBUSPOST_SETUP.md` for detailed configuration

### Razorpay Payments

- **Payment Processing**: Secure payment integration
- **Order Creation**: Razorpay order creation
- **Payment Verification**: Server-side payment verification
- **Webhook Handling**: Payment status updates
- **Refund Processing**: Refund handling

### Cloudinary/AWS S3

- **Image Storage**: Product and user image storage
- **Image Processing**: Automatic image optimization
- **CDN Integration**: Content delivery network
- **Multi-format Support**: Multiple image formats and sizes

### Nodemailer

- **Email Notifications**: Order confirmations, OTP emails
- **Transactional Emails**: Account-related communications
- **Template Support**: Email template management

### Sentry Error Monitoring

- **Error Tracking**: Real-time error monitoring
- **Performance Monitoring**: Transaction and performance tracking
- **Error Filtering**: Filters expected errors (401, 404, validation, rate limits)
- **Sensitive Data Filtering**: Removes headers, cookies, and sensitive data
- **User Context**: User information for error context
- **Environment Separation**: Separate tracking for development and production

## Environment Variables

### Required Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `PORT` | Server port | Optional (default: 5000) |
| `NODE_ENV` | Environment (development/production) | Optional |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | Optional (default: 7d) |
| `SESSION_SECRET` | Session secret | Optional |

### Optional Variables

| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` | Sentry Data Source Name |
| `SENTRY_RELEASE` | Sentry release version |
| `APP_VERSION` | Application version |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `NIMBUS_BASE_URL` | NimbusPost API URL |
| `NIMBUS_API_KEY` | NimbusPost API key |
| `PICKUP_PINCODE` | Default pickup pincode |
| `SELLER_NAME` | Seller name for shipping |
| `SELLER_PHONE` | Seller phone for shipping |
| `SELLER_EMAIL` | Seller email for shipping |
| `PICKUP_ADDRESS` | Pickup address |
| `PICKUP_CITY` | Pickup city |
| `PICKUP_STATE` | Pickup state |
| `RETURN_ADDRESS` | Return address |
| `RETURN_CITY` | Return city |
| `RETURN_STATE` | Return state |
| `RETURN_PINCODE` | Return pincode |
| `DEFAULT_PRODUCT_WEIGHT` | Default product weight (kg) |
| `EMAIL_HOST` | Email server host |
| `EMAIL_PORT` | Email server port |
| `EMAIL_USER` | Email username |
| `EMAIL_PASS` | Email password |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | AWS region |
| `AWS_S3_BUCKET` | AWS S3 bucket name |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `REQUEST_SIGNING_SECRET` | Request signing secret |

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory with the required environment variables. There is no `.env.example` file in the repository, so you'll need to create the `.env` file manually based on the variables listed above.

### Running the Application

```bash
# Development server with nodemon
npm run start

# Development server with ts-node
npm run dev

# Production build
npm run build

# Production server
npm run prod
```

The server will start on port 5000 (or the port specified in `PORT` environment variable).

### Database Connection

The application connects to MongoDB using the `MONGODB_URI` environment variable. The connection includes:
- Connection pooling (max 10 connections)
- Retry writes and reads
- Connection timeout configuration
- Automatic reconnection
- Graceful shutdown handling

## Logging

### Winston Logging

- **Structured Logging**: JSON-formatted logs
- **Request IDs**: Unique request tracking
- **Environment-specific Levels**: Different log levels for development and production
- **Error Logging**: Comprehensive error logging with context
- **Operational Logging**: Request/response logging for debugging

## Testing

**Automated test coverage**: Currently limited/not configured

The repository does not include automated tests. Test infrastructure would need to be added for comprehensive testing.

## Development Guidelines

### Architecture Principles

- **Follow Existing Patterns**: Use existing interactor, repository, and controller patterns
- **Separation of Concerns**: Keep business logic in interactors, data access in repositories
- **Interface-based Design**: Use interfaces for dependency injection
- **Type Safety**: Use TypeScript types for all data structures
- **Error Handling**: Implement proper error handling with meaningful messages

### API Development

- **Use Existing Routes**: Follow existing route patterns and middleware
- **Validate Input**: Validate all request inputs
- **Handle Errors**: Return appropriate HTTP status codes
- **Document APIs**: Add Swagger documentation for new endpoints
- **Security**: Apply appropriate security middleware (auth, CSRF, rate limiting)

### Database Operations

- **Use Repositories**: Access data through repository layer
- **Transaction Safety**: Use MongoDB transactions for multi-document operations
- **Error Handling**: Handle database errors gracefully
- **Indexing**: Add appropriate database indexes for performance

### Security Guidelines

- **Never Commit Secrets**: Never commit `.env` files or secrets
- **Use Environment Variables**: Use environment variables for all configuration
- **Validate Input**: Never trust client-provided data
- **Secure Passwords**: Use bcrypt for password hashing
- **Rate Limiting**: Apply appropriate rate limiting to public endpoints
- **Keep Security Updated**: Keep dependencies updated for security patches

## Project Architecture Overview

```
Frontend (Next.js port 3000)
    ↓
API Interceptors (CSRF, Request Signing, JWT)
    ↓
Backend API (Express port 5000)
    ↓
Middleware Stack (CORS, Rate Limiting, CSRF, Request Signing, Auth)
    ↓
Routes → Controllers → Interactors → Repositories → MongoDB
    ↓
External Integrations:
- NimbusPost (Shipping)
- Razorpay (Payments)
- Cloudinary/AWS S3 (Storage)
- Nodemailer (Email)
- Sentry (Error Tracking)
```

## Support

For support and questions, please contact the BellesCart team at support@bellescart.com.