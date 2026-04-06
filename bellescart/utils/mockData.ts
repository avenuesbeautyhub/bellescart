import { Product, User } from './types';

export const isMock = true; // Set to false to use real API calls

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Gold Bangles Set',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    description: 'Elegant gold bangles set perfect for traditional occasions. Made from 22k gold with intricate designs.',
    category: 'Jewelry',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    sizes: ['Small', 'Medium', 'Large'],
  },
  {
    id: '2',
    name: 'Diamond Necklace',
    price: 899.99,
    originalPrice: 1299.99,
    image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=500&h=500&fit=crop',
    description: 'Stunning diamond necklace with white gold setting. Perfect for special occasions and evening wear.',
    category: 'Jewelry',
    rating: 4.9,
    reviews: 89,
    inStock: true,
  },
  {
    id: '3',
    name: 'Silver Earrings',
    price: 79.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
    description: 'Delicate silver earrings with crystal accents. Versatile design suitable for daily wear.',
    category: 'Jewelry',
    rating: 4.6,
    reviews: 234,
    inStock: true,
    colors: ['Silver', 'Gold Plated'],
  },
  {
    id: '4',
    name: 'Perfume Gift Set',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=500&fit=crop',
    description: 'Luxury perfume gift set with three signature fragrances. Floral, oriental, and fresh scents included.',
    category: 'Perfumes',
    rating: 4.7,
    reviews: 178,
    inStock: true,
  },
  {
    id: '5',
    name: 'Rose Gold Bracelet',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    description: 'Beautiful rose gold bracelet with heart charm. Adjustable size for perfect fit.',
    category: 'Jewelry',
    rating: 4.5,
    reviews: 145,
    inStock: true,
  },
  {
    id: '6',
    name: 'Designer Handbag',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    description: 'Premium leather designer handbag with gold accents. Spacious and stylish for everyday use.',
    category: 'Accessories',
    rating: 4.8,
    reviews: 92,
    inStock: true,
    colors: ['Black', 'Brown', 'Tan'],
  },
  {
    id: '7',
    name: 'Pearl Necklace',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=500&fit=crop',
    description: 'Classic pearl necklace with silver clasp. Timeless elegance for any occasion.',
    category: 'Jewelry',
    rating: 4.9,
    reviews: 67,
    inStock: true,
  },
  {
    id: '8',
    name: 'Luxury Watch',
    price: 599.99,
    originalPrice: 799.99,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop',
    description: 'Elegant luxury watch with diamond bezel. Swiss movement with leather strap.',
    category: 'Accessories',
    rating: 4.7,
    reviews: 123,
    inStock: true,
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, State 12345',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    address: '456 Oak Ave, Town, State 67890',
  },
];

export const mockCategories = [
  'All Products',
  'Jewelry',
  'Perfumes',
  'Accessories',
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All Products') return mockProducts;
  return mockProducts.filter(product => product.category === category);
};

export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return mockProducts
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};

// Service functions
export const mockService = {
  getProducts: async (): Promise<Product[]> => {
    return mockProducts;
  },
  getUsers: async (): Promise<User[]> => {
    return mockUsers;
  },
};

export const userService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },
  getUsers: async (): Promise<User[]> => {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
};

// Function to get the appropriate service based on isMock
export const getDataService = () => {
  return isMock ? mockService : userService;
};
