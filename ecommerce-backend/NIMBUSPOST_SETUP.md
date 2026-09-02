# NimbusPost Integration Setup

This document explains how to set up NimbusPost Partner API v2 integration for the e-commerce backend.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# NimbusPost API Configuration
NIMBUS_BASE_URL=https://api.nimbuspost.com
NIMBUS_API_KEY=your_nimbuspost_api_key

# Pickup/Return Configuration
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

# Product Configuration
DEFAULT_PRODUCT_WEIGHT=0.070
```

## Getting NimbusPost Credentials

1. Sign up for a NimbusPost account at https://nimbuspost.com/
2. After registration, navigate to the API section in your dashboard
3. Generate API credentials (API Key)
4. Add these credentials to your `.env` file

## API Flow Overview

The NimbusPost integration follows this flow:

### Step 1: Authentication
- The system uses API key-based authentication
- API key is included in the Authorization header as Bearer token
- No token refresh required (API key is persistent)

### Step 2: Calculate Shipping Rates
- Called before shipment creation to get available couriers
- Returns available couriers with rates and estimated delivery days
- Can be used to show options to customers or auto-select cheapest

### Step 3: Create Shipment
- Called when payment succeeds
- Creates a shipment in NimbusPost system
- Returns `shipmentId`, `trackingId`, `airwayBill`, and `courierDetails`

### Step 4: Track Shipment
- Called to get real-time tracking status
- Returns current status and tracking history

### Step 5: Additional Features
- **Cancel Shipment**: Cancel a shipment if needed
- **Download Label**: Download shipping label for a shipment
- **Generate Manifest**: Generate manifest for multiple shipments
- **Request Pickup**: Schedule pickup for shipments
- **Courier List**: Get list of available couriers
- **Warehouse Management**: Manage pickup/return warehouses

## API Endpoints

### Calculate Shipping Rates
```http
POST /api/orders/shipping/calculate
Content-Type: application/json
Authorization: Bearer <user_token>

{
  "delivery_postcode": "691001",
  "cod": 0
}
```

**Note:**
- `pickup_postcode` is automatically set to 691305 (Belles Avenue Fashion Hub)
- `weight` is automatically calculated from cart items (default 70g per item × quantity)
- `cod` is optional - if not provided, uses cart total amount

Response will show available couriers and their rates:
```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "courierId": "courier_123",
        "courierName": "Delhivery",
        "estimatedDays": "3",
        "rate": 120,
        "cod": true,
        "codCharges": 0
      },
      {
        "courierId": "courier_456",
        "courierName": "Ecom Express",
        "estimatedDays": "4",
        "rate": 95,
        "cod": true,
        "codCharges": 0
      }
    ],
    "totalWeight": 0.140,
    "totalAmount": 1000
  }
}
```

### Create Order with NimbusPost Integration
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer <user_token>

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Kollam",
    "state": "Kerala",
    "zipCode": "691001",
    "country": "India"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "Kollam",
    "state": "Kerala",
    "zipCode": "691001",
    "country": "India"
  },
  "paymentMethod": "razorpay",
  "notes": "Please deliver between 9 AM - 5 PM",
  "calculatedShippingFee": 95,
  "processNimbus": true,
  "nimbusCourierId": "courier_456"
}
```

### Track Order by AWB
```http
GET /api/orders/track/:awb
```

### Track Order by Order ID
```http
GET /api/orders/:id/track
Authorization: Bearer <user_token>
```

### Retry NimbusPost Integration
```http
POST /api/orders/:orderId/nimbus/retry
Authorization: Bearer <user_token>

{
  "courierId": "courier_456"
}
```

## Database Schema Changes

The Order model has been updated to include NimbusPost fields:

```typescript
nimbus?: {
  shipmentId?: string;
  trackingId?: string;
  airwayBill?: string;
  courier?: string;
  shipmentStatus?: string;
  expectedDelivery?: Date;
}
```

## Integration in Checkout Flow

NimbusPost is integrated into the main order creation flow. The recommended flow is:

### Frontend Checkout Flow

**Step 1: User Adds Items to Cart**
- User browses products and adds items to cart
- Cart shows items and subtotal

**Step 2: User Goes to Checkout Page**
- After cart, user proceeds to checkout page
- Checkout page requests delivery address from user
- User enters: street, city, state, pincode, country

**Step 3: Calculate Shipping Rates (Automatic)**
- When user enters delivery pincode, frontend calls:
```json
POST /api/orders/shipping/calculate
{
  "delivery_postcode": "691001",
  "cod": 0
}
```

**Note:**
- `pickup_postcode` is automatically set to 691305 (Belles Avenue Fashion Hub)
- `weight` is automatically calculated from cart items (default 70g per item × quantity)
- `cod` is optional - if not provided, uses cart total amount

Response will show available couriers and their rates:
```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "courierId": "courier_123",
        "courierName": "Delhivery",
        "estimatedDays": "3",
        "rate": 120
      },
      {
        "courierId": "courier_456",
        "courierName": "Ecom Express",
        "estimatedDays": "4",
        "rate": 95
      }
    ],
    "totalWeight": 0.140,
    "totalAmount": 1000
  }
}
```

**Step 4: User Selects Courier**
- Frontend displays courier options with rates and delivery times
- User selects preferred courier (e.g., Ecom Express - ₹95)

**Step 5: Calculate Order Total**
- Frontend calculates: Subtotal + Tax + Selected Shipping Fee - Discount
- Display final total to user

**Step 6: User Proceeds to Payment**
- User confirms order and proceeds to payment
- Payment processed via Razorpay

**Step 7: Create Order with Selected Courier**
After successful payment, frontend creates order:
```json
POST /api/orders
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Kollam",
    "state": "Kerala",
    "zipCode": "691001",
    "country": "India"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "Kollam",
    "state": "Kerala",
    "zipCode": "691001",
    "country": "India"
  },
  "paymentMethod": "razorpay",
  "notes": "Please deliver between 9 AM - 5 PM",
  "calculatedShippingFee": 95,
  "processNimbus": true,
  "nimbusCourierId": "courier_456"
}
```

### Flow Details

**Pickup Location (Default):**
- Belles Avenue Fashion Hub
- Post Office Junction
- Pincode: 691305

**Order Total Calculation:**
- Total = Subtotal + Tax + Calculated Shipping Fee - Discount

**Weight Calculation:**
- Default weight per item: 70g (0.070kg)
- Total weight = (product weight or 70g) × quantity
- Example: 2 items = 70g × 2 = 140g (0.140kg)

**When `processNimbus: true` is set:**
1. **Order Creation**: Order is created in the database with calculated shipping fee
2. **Cart Processing**: Cart items are converted to order items
3. **NimbusPost Shipment**: Shipment is automatically created in NimbusPost system
4. **Courier Assignment**: Courier is assigned and AWB is generated
5. **Order Update**: Order is updated with NimbusPost details (AWB, courier, tracking status)
6. **Email Confirmation**: Order confirmation email is sent with tracking details

### Manual Integration (Alternative)

If you prefer manual control over the NimbusPost flow:

1. **Calculate Shipping**: Call `POST /api/orders/shipping/calculate` to get available couriers
2. **Create Order**: Create order with `calculatedShippingFee` parameter
3. **Retry NimbusPost**: Call `POST /api/orders/:orderId/nimbus/retry` after payment success
4. **Track Shipments**: Use `GET /api/orders/track/:awb` or `GET /api/orders/:id/track` for tracking

## Error Handling

The NimbusPost service includes comprehensive error handling:
- Authentication failures
- API errors from NimbusPost
- Missing required fields
- Invalid data formats

All errors are logged and returned with appropriate HTTP status codes.

## Testing

To test the integration:
1. Add valid NimbusPost credentials to your `.env` file
2. Create a test order in the system
3. Call the shipping calculation endpoint
4. Process the complete NimbusPost flow
5. Track the order using the returned tracking ID

## Notes

- NimbusPost uses API key authentication (no token refresh required)
- Pickup location should be configured in your NimbusPost dashboard
- Courier IDs are returned by the shipping rate calculation endpoint
- Make sure your NimbusPost account has sufficient balance for prepaid orders
