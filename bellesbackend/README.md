# BellesCart Backend API

A production-ready e-commerce backend built with Node.js, Express.js, and MongoDB following Clean Architecture principles.

## Features

- **Clean Architecture**: Separation of concerns with Controllers, Interactors, Services, and Repositories
- **Dependency Injection**: Centralized DI container for better testability
- **Authentication**: JWT-based authentication with role-based access control
- **Product Management**: Full CRUD operations for products and categories
- **Shopping Cart**: Add, update, and remove cart items with real-time calculations
- **Order Management**: Complete order lifecycle with status tracking
- **Wishlist**: User wishlist functionality
- **Delivery Fee Calculation**: Automatic delivery fee based on order total
- **Error Handling**: Centralized error handling with structured responses
- **Logging**: Winston-based logging system
- **Rate Limiting**: Protection against API abuse
- **Security**: Helmet, CORS, and input validation

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **TypeScript** - Type safety
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **Joi** - Input validation

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/       # HTTP request handlers
├── interactors/      # Application use cases
├── services/         # Business logic
├── repositories/     # Data access layer
├── entities/         # Database models
├── dto/             # Data transfer objects
├── middleware/      # Express middleware
├── utils/           # Utility functions
├── routes/          # API routes
├── constants/       # Application constants
└── responses/       # Response helpers
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bellescart
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/refresh` - Refresh JWT token

### Product Endpoints

- `GET /api/products` - Get all products (with pagination, filtering, sorting)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search` - Search products
- `GET /api/products/popular` - Get popular products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart Endpoints

- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Order Endpoints

- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `DELETE /api/orders/:id` - Cancel order

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error occurred",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Business Rules

### Delivery Fee Calculation
- Order total < ₹499 → ₹40 delivery fee
- Order total ₹500-₹1000 → ₹20 delivery fee  
- Order total > ₹1000 → Free delivery

### Order Status Flow
1. `pending` → `confirmed` → `processing` → `shipped` → `delivered`
2. Orders can be `cancelled` from `pending` or `confirmed` status

## Error Codes

Common error codes:
- `INVALID_CREDENTIALS` - Invalid login credentials
- `TOKEN_EXPIRED` - JWT token has expired
- `PRODUCT_NOT_FOUND` - Product does not exist
- `INSUFFICIENT_STOCK` - Not enough stock available
- `CART_EMPTY` - Cart is empty
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions

## Development

### Adding New Features

1. **Entity**: Define database schema in `entities/`
2. **Repository**: Implement data access in `repositories/`
3. **Service**: Add business logic in `services/`
4. **Interactor**: Create use case in `interactors/`
5. **Controller**: Handle HTTP requests in `controllers/`
6. **Routes**: Define API endpoints in `routes/`
7. **DI Container**: Wire up dependencies in `config/diContainer.ts`

### Database Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `.env`
3. The application will automatically create the database and collections

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Rate limiting to prevent abuse
- CORS enabled for cross-origin requests
- Helmet for security headers
- Input validation and sanitization

## Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Testing

```bash
npm test
```

## License

MIT
