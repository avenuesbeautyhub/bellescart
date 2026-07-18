# Shiprocket Integration Setup

This document explains how to set up Shiprocket API integration for the e-commerce backend.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Shiprocket API Configuration
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_PICKUP_PINCODE=691305
SHIPROCKET_PICKUP_LOCATION=Home
```

## Getting Shiprocket Credentials

1. Sign up for a Shiprocket account at https://shiprocket.in/
2. After registration, navigate to the API section in your dashboard
3. Generate API credentials (email and password)
4. Add these credentials to your `.env` file

## API Flow Overview

The Shiprocket integration follows this flow:

### Step 1: Authentication
- The system automatically authenticates with Shiprocket using the provided credentials
- Token is cached for 10 days (as per Shiprocket's token validity)
- Automatic token refresh when expired

### Step 2: Create Order
- Called when payment succeeds
- Creates an order in Shiprocket system
- Returns `shiprocketOrderId` and `shipmentId`

### Step 3: Calculate Shipping Rates
- Called before shipment creation
- Returns available couriers with rates and estimated delivery days
- Can be used to show options to customers or auto-select cheapest

### Step 4: Assign Courier
- Called after customer confirms courier selection
- Generates AWB (Air Way Bill) number
- Returns courier details and shipment ID

### Step 5: Schedule Pickup
- Called after AWB generation
- Schedules courier pickup for the shipment

### Step 6: Track Order
- Called to get real-time tracking status
- Returns current status and tracking history

## API Endpoints

### Calculate Shipping Rates
```http
POST /api/orders/shipping/calculate
Content-Type: application/json

{
  "pickup_postcode": "110001",
  "delivery_postcode": "691001",
  "weight": 0.5,
  "cod": 0
}
```

### Process Shiprocket Order (Complete Flow)
```http
POST /api/orders/shiprocket/process
Content-Type: application/json
Authorization: Bearer <user_token>

{
  "orderId": "order_id_from_db",
  "orderData": {
    "order_id": "ORD1001",
    "order_date": "2026-07-15",
    "pickup_location": "Home",
    "billing_customer_name": "John",
    "billing_phone": "9876543210",
    "billing_address": "ABC",
    "billing_city": "Kollam",
    "billing_pincode": "691001",
    "billing_state": "Kerala",
    "billing_country": "India",
    "shipping_is_billing": true,
    "order_items": [
      {
        "name": "Watch",
        "sku": "W01",
        "units": 1,
        "selling_price": "1200"
      }
    ],
    "payment_method": "Prepaid",
    "sub_total": "1200",
    "length": "10",
    "breadth": "10",
    "height": "5",
    "weight": "0.5"
  },
  "shippingRequest": {
    "pickup_postcode": "110001",
    "delivery_postcode": "691001",
    "weight": 0.5,
    "cod": 0
  },
  "courierId": 123
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

## Database Schema Changes

The Order model has been updated to include Shiprocket fields:

```typescript
shiprocket?: {
  orderId?: string;
  shipmentId?: string;
  awb?: string;
  courier?: string;
  trackingStatus?: string;
  expectedDelivery?: Date;
}
```

## Integration in Checkout Flow

Shiprocket is now integrated into the main order creation flow. The recommended flow is:

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
- `weight` is automatically calculated from cart items (default 52g per item × quantity)
- `cod` is optional - if not provided, uses cart total amount

Response will show available couriers and their rates:
```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "courier": "Delhivery",
        "rate": 120,
        "estimated_days": 3,
        "courierId": 123
      },
      {
        "courier": "Ecom Express",
        "rate": 95,
        "estimated_days": 4,
        "courierId": 456
      }
    ],
    "totalWeight": 0.104,
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
  "processShiprocket": true,
  "shiprocketCourierId": 456
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
- Default weight per item: 52g (0.052kg)
- Total weight = (product weight or 52g) × quantity
- Example: 2 items = 52g × 2 = 104g (0.104kg)

**When `processShiprocket: true` is set:**
1. **Order Creation**: Order is created in the database with calculated shipping fee
2. **Cart Processing**: Cart items are converted to order items
3. **Shiprocket Order**: Order is automatically created in Shiprocket system
4. **Courier Assignment**: Courier is assigned and AWB is generated
5. **Pickup Scheduling**: Courier pickup is scheduled automatically from 691305
6. **Order Update**: Order is updated with Shiprocket details (AWB, courier, tracking status)
7. **Email Confirmation**: Order confirmation email is sent with tracking details

### Manual Integration (Alternative)

If you prefer manual control over the Shiprocket flow:

1. **Calculate Shipping**: Call `POST /api/orders/shipping/calculate` to get available couriers
2. **Create Order**: Create order with `calculatedShippingFee` parameter
3. **Process Shiprocket**: Call `POST /api/orders/shiprocket/process` after payment success
4. **Track Shipments**: Use `GET /api/orders/track/:awb` or `GET /api/orders/:id/track` for tracking

## Error Handling

The Shiprocket service includes comprehensive error handling:
- Authentication failures
- API errors from Shiprocket
- Missing required fields
- Invalid data formats

All errors are logged and returned with appropriate HTTP status codes.

## Testing

To test the integration:
1. Add valid Shiprocket credentials to your `.env` file
2. Create a test order in the system
3. Call the shipping calculation endpoint
4. Process the complete Shiprocket flow
5. Track the order using the returned AWB number

## Notes

- Shiprocket tokens are valid for 10 days
- The service automatically handles token refresh
- Pickup location should be configured in your Shiprocket dashboard
- Courier IDs are returned by the shipping rate calculation endpoint
- Make sure your Shiprocket account has sufficient balance for prepaid orders
