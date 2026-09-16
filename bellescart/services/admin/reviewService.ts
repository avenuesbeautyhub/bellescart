import { apiGet, apiPatch, apiDelete } from '../apiInterceptor';

export interface AdminReview {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  product?: {
    _id: string;
    name: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface AdminReviewsResponse {
  success: boolean;
  data: {
    reviews: AdminReview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AdminReviewResponse {
  success: boolean;
  data: {
    review: AdminReview;
  };
}

class AdminReviewService {
  async getAllReviews(params?: {
    page?: number;
    limit?: number;
    status?: string;
    productId?: string;
    userId?: string;
  }): Promise<AdminReviewsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.userId) queryParams.append('userId', params.userId);

    const url = `/admin/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiGet(url);
    return response.json();
  }

  async updateReviewStatus(reviewId: string, status: 'pending' | 'approved' | 'rejected'): Promise<AdminReviewResponse> {
    const response = await apiPatch(`/admin/reviews/${reviewId}/status`, { status });
    return response.json();
  }

  async deleteReview(reviewId: string): Promise<AdminReviewResponse> {
    const response = await apiDelete(`/admin/reviews/${reviewId}`);
    return response.json();
  }

  async getReviewSummary(productId: string): Promise<{
    success: boolean;
    data: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: { [key: string]: number };
    };
  }> {
    const response = await apiGet(`/admin/reviews/summary/${productId}`);
    return response.json();
  }
}

export const adminReviewService = new AdminReviewService();