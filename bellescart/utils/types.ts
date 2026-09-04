export interface ProductImage {
  url: string;
  alt: string;
  isMain: boolean;
  _id: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  description: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: ProductCategory;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
  images: ProductImage[];
  brand?: string;
  quantity: number;
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'user' | 'admin';
}

export interface CartItem extends Product {
  quantity: number;
  cartQuantity?: number;
  stock?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shippingAddress: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
