export interface ICreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  stock?: number;
}

export interface IUpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  stock?: number;
  isActive?: boolean;
}

export interface IProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  inStock?: boolean;
}
