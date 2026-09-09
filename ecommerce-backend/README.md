# BellesCart E-commerce Backend

A comprehensive, scalable e-commerce backend built with Node.js, Express, TypeScript, and MongoDB, following clean architecture principles.

## Features

### Core E-commerce Functionality
- **User Management**: Registration, authentication, profile management, wishlist
- **Product Catalog**: Product CRUD, categories, search, filtering, inventory management
- **Shopping Cart**: Add/remove items, quantity management, coupon support
- **Order Management**: Order processing, status tracking, payment integration ready
- **Shipping Integration**: NimbusPost API integration for shipping rates, courier assignment, and order tracking
- **Admin Features**: Product management, order management, analytics dashboard

### Technical Features
- **Clean Architecture**: Separation of concerns with Controllers, Services, and Repositories
- **TypeScript**: Full type safety and better development experience
- **MongoDB**: Scalable NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **API Documentation**: Swagger UI for interactive API documentation
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Project Structure

```
ecommerce-backend/
src/
  config/           # Configuration files (database, CORS, Swagger)
  controllers/      # Request handlers and response formatting
  middleware/       # Custom middleware (auth, error handling)
  models/          # Database models and schemas
  repositories/     # Data access layer (Repository pattern)
  services/        # Business logic layer
  routes/          # API route definitions
  utils/           # Utility functions (JWT, validation)
  public/          # Static files
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/bellescart

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d

   # Session Configuration
   SESSION_SECRET=your-super-secret-session-key

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=bellescart-product-images

   # Razorpay Configuration
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret

   # NimbusPost Configuration
   NIMBUS_BASE_URL=https://api.nimbuspost.com
   NIMBUS_API_KEY=your-nimbuspost-api-key
   PICKUP_PINCODE=691305
   SELLER_NAME=BellesCart
   SELLER_PHONE=0000000000
   SELLER_EMAIL=support@bellescart.com
   PICKUP_ADDRESS=Belles Avenue Fashion Hub, Post office junction
   PICKUP_CITY=Punlalur
   PICKUP_STATE=Kerala
   RETURN_ADDRESS=Returns Center
   RETURN_CITY=Mumbai
   RETURN_STATE=Maharashtra
   RETURN_PINCODE=400001
   DEFAULT_PRODUCT_WEIGHT=0.070
   ```

### Running the Application

1. Start MongoDB (if running locally)

2. Run the development server:
   ```bash
   npm run start
   ```

3. For production:
   ```bash
   npm run build
   npm run prod
   ```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filtering, pagination, search)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/item/:itemId` - Update cart item quantity
- `DELETE /api/cart/item/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `POST /api/orders/shipping/calculate` - Calculate shipping rates (weight auto-calculated from cart)
- `GET /api/orders/track/:awb` - Track order by AWB number
- `GET /api/orders/:id/track` - Track order by order ID
- `POST /api/orders/:orderId/nimbus/retry` - Retry NimbusPost integration for an existing order

## Architecture Patterns

### Repository Pattern
The repository pattern abstracts the data layer and provides a clean interface for data operations:
- `BaseRepository<T>`: Generic repository with common CRUD operations
- `UserRepository`, `ProductRepository`, `OrderRepository`, `CartRepository`: Specific repositories

### Service Layer
Business logic is encapsulated in service classes:
- `AuthService`: User authentication and profile management
- `ProductService`: Product catalog operations
- `CartService`: Shopping cart operations
- `OrderService`: Order processing and management
- `NimbusPostService`: Shipping integration with NimbusPost API
- `PaymentService`: Payment processing with Razorpay

### Controllers
Controllers handle HTTP requests and responses:
- Parse request data
- Call appropriate service methods
- Format responses
- Handle errors

## NimbusPost Integration

The backend includes comprehensive NimbusPost API integration for shipping management:

### Features
- **Authentication**: API key-based authentication with persistent tokens
- **Shipping Rate Calculation**: Get real-time courier rates and delivery estimates
- **Order Creation**: Create shipments in NimbusPost system after payment success
- **Courier Assignment**: Automatic courier assignment and AWB generation
- **Order Tracking**: Real-time shipment tracking with status updates
- **Address Management**: Manage pickup and return addresses
- **Warehouse Management**: Manage pickup/return warehouses
- **Label Generation**: Download shipping labels for shipments
- **Manifest Generation**: Generate manifests for multiple shipments

### Pickup Location
- **Belles Avenue Fashion Hub**
- **Post Office Junction**
- **Pincode**: 691305 (default)

### Integration Flow
1. **Calculate Shipping**: User enters delivery pincode, system calculates shipping rates
2. **Select Courier**: User selects courier from available options
3. **Create Order**: Order is created with calculated shipping fee
4. **Process NimbusPost**: Complete flow creates shipment, assigns courier, generates tracking
5. **Track Shipments**: Provide real-time tracking to customers

### Database Schema
Orders now include NimbusPost fields:
```typescript
nimbus?: {
  shipmentId?: string;      // Shipment ID
  trackingId?: string;     // Tracking ID
  airwayBill?: string;     // Air Way Bill number
  courier?: string;        // Courier name
  shipmentStatus?: string; // Current shipment status
  expectedDelivery?: Date; // Expected delivery date
}
```

### Setup Instructions
See `NIMBUSPOST_SETUP.md` for detailed setup instructions and API examples.

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Rate Limiting**: Prevent API abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Input Validation**: Request validation and sanitization

## Database Schema

### Users
- Basic user information
- Authentication credentials
- Address management
- Wishlist functionality

### Products
- Product details and descriptions
- Inventory management
- Categories and tags
- Images and variants
- Pricing and shipping

### Orders
- Order items and quantities
- Shipping and billing addresses
- Payment information
- Order status tracking

### Carts
- User shopping carts
- Item quantities and prices
- Coupon support
- Expiration handling

## Development

### Scripts
- `npm run start` - Start development server with nodemon
- `npm run dev` - Start with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm run prod` - Run production build

### Environment Variables
All configuration is done through environment variables. See `.env.example` for required variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the BellesCart team at support@bellescart.com.
