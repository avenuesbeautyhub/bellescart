import { Product, User } from './types';

export const isMock = true; // Set to false to use real API calls

export const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Gold Bangles Set',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    description: 'Elegant gold bangles set perfect for traditional occasions. Made from 22k gold with intricate designs.',
    category: {
      _id: 'cat1',
      name: 'Jewelry',
      description: 'Fine jewelry and accessories'
    },
    rating: 4.8,
    reviews: 156,
    inStock: true,
    sizes: ['Small', 'Medium', 'Large'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
        alt: 'Gold Bangles Set - Main Image',
        isMain: true,
        _id: 'img1'
      }
    ],
    brand: 'Luxury Jewelry',
    quantity: 10,
    tags: ['gold', 'bangles', 'traditional'],
    status: 'active',
    featured: true
  },
  {
    _id: '2',
    name: 'Diamond Necklace',
    price: 899.99,
    originalPrice: 1299.99,
    image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=500&h=500&fit=crop',
    description: 'Stunning diamond necklace with white gold setting. Perfect for special occasions and evening wear.',
    category: {
      _id: 'cat1',
      name: 'Jewelry',
      description: 'Fine jewelry and accessories'
    },
    rating: 4.9,
    reviews: 89,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=500&h=500&fit=crop',
        alt: 'Diamond Necklace - Main Image',
        isMain: true,
        _id: 'img3'
      }
    ],
    brand: 'Luxury Jewelry',
    quantity: 5,
    tags: ['diamond', 'necklace', 'luxury'],
    status: 'active',
    featured: true
  },
  {
    _id: '3',
    name: 'Silver Earrings',
    price: 79.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
    description: 'Delicate silver earrings with crystal accents. Versatile design suitable for daily wear.',
    category: {
      _id: 'cat1',
      name: 'Jewelry',
      description: 'Fine jewelry and accessories'
    },
    rating: 4.6,
    reviews: 234,
    inStock: true,
    colors: ['Silver', 'Gold Plated'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
        alt: 'Silver Earrings - Main Image',
        isMain: true,
        _id: 'img4'
      }
    ],
    brand: 'Luxury Jewelry',
    quantity: 15,
    tags: ['silver', 'earrings', 'crystal'],
    status: 'active',
    featured: false
  },
  {
    _id: '4',
    name: 'Perfume Gift Set',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=500&fit=crop',
    description: 'Luxury perfume gift set with three signature fragrances. Floral, oriental, and fresh scents included.',
    category: {
      _id: 'cat1',
      name: 'Jewelry',
      description: 'Fine jewelry and accessories'
    },
    rating: 4.7,
    reviews: 178,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=500&fit=crop',
        alt: 'Perfume Gift Set - Main Image',
        isMain: true,
        _id: 'img5'
      }
    ],
    brand: 'Luxury Fragrances',
    quantity: 20,
    tags: ['perfume', 'gift', 'fragrance'],
    status: 'active',
    featured: false
  },
  {
    _id: '5',
    name: 'Rose Gold Bracelet',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    description: 'Beautiful rose gold bracelet with heart charm. Adjustable size for perfect fit.',
    category: {
      _id: 'cat1',
      name: 'Jewelry',
      description: 'Fine jewelry and accessories'
    },
    rating: 4.5,
    reviews: 145,
    inStock: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
        alt: 'Rose Gold Bracelet - Main Image',
        isMain: true,
        _id: 'img6'
      }
    ],
    brand: 'Luxury Jewelry',
    quantity: 8,
    tags: ['rose gold', 'bracelet', 'heart'],
    status: 'active',
    featured: false
  },
  {
    _id: '6',
    name: 'Designer Handbag',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    description: 'Premium leather designer handbag with gold accents. Spacious and stylish for everyday use.',
    category: {
      _id: 'cat2',
      name: 'Accessories',
      description: 'Fashion accessories and bags'
    },
    rating: 4.8,
    reviews: 92,
    inStock: true,
    colors: ['Black', 'Brown', 'Tan'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
        alt: 'Designer Handbag - Main Image',
        isMain: true,
        _id: 'img7'
      }
    ],
    brand: 'Luxury Fashion',
    quantity: 12,
    tags: ['handbag', 'leather', 'designer'],
    status: 'active',
    featured: false
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
  return mockProducts.find(product => product._id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All Products') return mockProducts;
  return mockProducts.filter(product => product.category.name === category);
};

export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];

  return mockProducts
    .filter(p => p._id !== productId && p.category === product.category)
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
