import { apiPost, apiGet, apiPut, apiDelete, publicApiGet } from './apiInterceptor';

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string; // Always string ID
  user?: User; // Populated user data
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface ReviewEligibility {
  canReview: boolean;
  hasReviewed: boolean;
  isVerifiedPurchase: boolean;
  userReview?: Review;
}

export interface ReviewResponse {
  success: boolean;
  data: {
    review: Review;
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface EligibilityResponse {
  success: boolean;
  data: ReviewEligibility;
}

export interface SummaryResponse {
  success: boolean;
  data: ReviewSummary;
}

export interface SummariesResponse {
  success: boolean;
  data: Record<string, {
    averageRating: number;
    totalReviews: number;
  }>;
}

class ReviewService {
  async createReview(data: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }): Promise<ReviewResponse> {
    const response = await apiPost('/reviews', data);
    return response.json();
  }

  async getReviewsByProduct(productId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ReviewsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `/public/products/${productId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await publicApiGet(url);
    return response.json();
  }

  async getMyReviews(params?: {
    page?: number;
    limit?: number;
  }): Promise<ReviewsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/reviews/my${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiGet(url);
    return response.json();
  }

  async getReviewEligibility(productId: string): Promise<EligibilityResponse> {
    const response = await apiGet(`/reviews/eligibility/${productId}`);
    return response.json();
  }

  async updateReview(reviewId: string, data: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<ReviewResponse> {
    const response = await apiPut(`/reviews/${reviewId}`, data);
    return response.json();
  }

  async deleteReview(reviewId: string): Promise<ReviewResponse> {
    const response = await apiDelete(`/reviews/${reviewId}`);
    return response.json();
  }

  async getReviewSummary(productId: string): Promise<SummaryResponse> {
    const response = await publicApiGet(`/public/reviews/summary/${productId}`);
    return response.json();
  }

  async getReviewSummaries(productIds: string[]): Promise<SummariesResponse> {
    const response = await publicApiGet(`/public/reviews/summaries?productIds=${productIds.join(',')}`);
    return response.json();
  }
}

export const reviewService = new ReviewService();