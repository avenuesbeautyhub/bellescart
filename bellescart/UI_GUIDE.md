# BellesCart - UI Implementation Guide

## Project Overview
BellesCart is a modern ecommerce platform for Belles Avenue, featuring a complete frontend UI built with Next.js, React, and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Components**: Reusable React components
- **Mock Data**: TypeScript interfaces and mock data utilities
- **Icons**: SVG-based (no external icon library needed yet)

## Folder Structure

```
bellescart/
├── app/
│   ├── page.tsx                 # Home/Landing page
│   ├── products/
│   │   └── page.tsx             # Products listing page
│   ├── product/
│   │   └── page.tsx             # Product details page
│   ├── cart/
│   │   └── page.tsx             # Shopping cart page
│   ├── checkout/
│   │   └── page.tsx             # Checkout page
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── signup/
│   │   └── page.tsx             # Signup page
│   ├── wishlist/
│   │   └── page.tsx             # Wishlist page
│   ├── orders/
│   │   └── page.tsx             # Orders history page
│   ├── profile/
│   │   └── page.tsx             # User profile page
│   ├── admin/
│   │   ├── page.tsx             # Admin login
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Admin dashboard
│   │   ├── products/
│   │   │   └── page.tsx         # Product management
│   │   ├── categories/
│   │   │   └── page.tsx         # Category management
│   │   └── orders/
│   │       └── page.tsx         # Orders management
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Navbar/
│   │   └── Navbar.tsx
│   ├── Footer/
│   │   └── Footer.tsx
│   ├── ProductCard/
│   │   └── ProductCard.tsx
│   ├── ProductGrid/
│   │   └── ProductGrid.tsx
│   ├── CartItem/
│   │   └── CartItem.tsx
│   ├── OrderCard/
│   │   └── OrderCard.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Badge.tsx
│       └── Rating.tsx
├── utils/
│   ├── types.ts                 # TypeScript interfaces
│   └── mockData.ts              # Mock data for products
└── services/
    └── api.ts                   # API service (placeholder for future backend)
```

## Pages & Features

### Public Pages
1. **Home Page** (`/`)
   - Hero section with call-to-action
   - Featured products grid
   - Category preview
   - Newsletter subscription
   - Navigation bar and footer

2. **Products Listing** (`/products`)
   - Product grid with responsive layout
   - Sidebar filters (categories, sorting)
   - Product cards with pricing and ratings
   - Sort by: Featured, Price, Rating

3. **Product Details** (`/product?id={id}`)
   - Product image gallery
   - Product information (name, price, description)
   - Product rating and reviews count
   - Size and color options
   - Quantity selector
   - Add to cart and wishlist buttons
   - Related products section
   - Shipping information

4. **Shopping Cart** (`/cart`)
   - Cart items display
   - Quantity adjustment
   - Remove items
   - Order summary with subtotal, shipping, tax
   - Proceed to checkout button

5. **Checkout** (`/checkout`)
   - Shipping address form
   - Payment method selection
   - Order review
   - Order summary with total

6. **Login** (`/login`)
   - Email and password login
   - Remember me option
   - Social login buttons (UI only)
   - Link to signup page

7. **Signup** (`/signup`)
   - Create account form
   - Email, password, confirm password
   - Terms and conditions agreement
   - Form validation
   - Link to login page

8. **Wishlist** (`/wishlist`)
   - Display wishlisted products
   - Add to cart directly from wishlist
   - Remove from wishlist

9. **Orders** (`/orders`)
   - Order history display
   - Order cards with status
   - Order details (ID, date, total, status)

10. **Profile** (`/profile`)
    - User information display
    - Edit profile functionality
    - Personal details management
    - Account statistics

### Admin Pages
1. **Admin Login** (`/belles-portel-25`)
   - Admin credentials form
   - Security-focused interface

2. **Admin Dashboard** (`/belles-portel-25/dashboard`)
   - Statistics cards (products, orders, revenue, users)
   - Recent orders table
   - Quick access to management sections

3. **Product Management** (`/belles-portel-25/products`)
   - Product listing table
   - Search and filters
   - Add/Edit/Delete products
   - Category and status filters

4. **Category Management** (`/belles-portel-25/categories`)
   - Category grid display
   - Add new category form
   - Edit/Delete categories
   - Product count per category

5. **Orders Management** (`/belles-portel-25/orders`)
   - Orders listing table
   - Status filters
   - Search functionality
   - Order details view
   - Status update options

## Reusable Components

### UI Components (`components/ui/`)
- **Button**: Primary, secondary, danger, outline variants; sm, md, lg sizes
- **Input**: Text input with labels and error messages
- **Select**: Dropdown select with options
- **Badge**: Status badges with multiple color variants
- **Rating**: 5-star rating display and interactive rating

### Feature Components
- **Navbar**: Responsive navigation with mobile menu
- **Footer**: Multi-column footer with links and newsletter
- **ProductCard**: Product card with image, price, rating, add to cart
- **ProductGrid**: Responsive grid layout for products
- **CartItem**: Cart item display with quantity adjuster
- **OrderCard**: Order summary card with status

## Mock Data

Located in `utils/mockData.ts`:
- 8 sample products with realistic data
- Product categories
- Mock order data
- Helper functions for filtering and searching

### Product Structure
```typescript
{
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  sizes?: string[];
  colors?: string[];
}
```

## Styling

- **Framework**: Tailwind CSS for utility-first styling
- **Responsive**: Mobile-first responsive design
- **Colors**: Blue primary color (#3B82F6), with supporting grays
- **Components**: Consistent spacing, shadows, and transitions
- **Dark Mode**: Built-in dark mode support via CSS variables

## Component Examples

### Using ProductGrid
```tsx
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import { mockProducts } from '@/utils/mockData';

<ProductGrid 
  products={mockProducts}
  onAddToCart={(product) => console.log(product)}
  onAddToWishlist={(product) => console.log(product)}
/>
```

### Using Button
```tsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="lg">
  Click me
</Button>
```

## Future Backend Integration

The frontend is ready to connect to a backend with:
- API endpoints in `services/api.ts`
- Type definitions in `utils/types.ts`
- Mock data easily replaceable with real API calls

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

The application will be available at `http://localhost:3000`

## Key Features Implemented

✅ Complete UI layout design
✅ Responsive mobile and desktop views
✅ Reusable component system
✅ Mock data for products
✅ Form validation and error handling
✅ Product filtering and sorting
✅ Shopping cart functionality
✅ Order management
✅ Admin dashboard
✅ User profile management
✅ Clean folder structure
✅ TypeScript support
✅ Tailwind CSS styling

## Notes

- All API calls are currently mocked and use static data
- Authentication and payment processing are UI-only (backend to be implemented)
- Database integration pending
- Real image URLs are used from Unsplash for demonstration
- All forms are functional UI but don't save data

## Next Steps (Backend Implementation)

1. Set up Node.js + Express backend
2. Create MongoDB database schema
3. Implement authentication APIs
4. Connect product APIs
5. Set up payment gateway
6. Deploy frontend and backend
