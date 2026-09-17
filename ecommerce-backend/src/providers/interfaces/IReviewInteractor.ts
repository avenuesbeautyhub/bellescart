import { IReview } from '../../models/Review';

export interface IReviewInteractor {
  createReview(userId: string, reviewData: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }): Promise<IReview>;
  getReviewsByProduct(productId: string, filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ reviews: IReview[]; pagination: any }>;
  getReviewsByUser(userId: string, filters?: {
    page?: number;
    limit?: number;
  }): Promise<{ reviews: IReview[]; pagination: any }>;
  getReviewById(reviewId: string): Promise<IReview | null>;
  updateReview(reviewId: string, userId: string, updateData: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<IReview | null>;
  deleteReview(reviewId: string, userId: string): Promise<IReview | null>;
  getReviewEligibility(userId: string, productId: string): Promise<{
    canReview: boolean;
    hasReviewed: boolean;
    isVerifiedPurchase: boolean;
    userReview?: IReview;
  }>;
  getReviewSummary(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: string]: number };
  }>;
  getReviewSummaries(productIds: string[]): Promise<Map<string, {
    averageRating: number;
    totalReviews: number;
  }>>;
  updateReviewStatus(reviewId: string, status: 'pending' | 'approved' | 'rejected'): Promise<IReview | null>;
  getAllReviews(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    productId?: string;
    userId?: string;
  }): Promise<{ reviews: IReview[]; pagination: any }>;
}