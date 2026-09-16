import { IReview } from '../../models/Review';

export interface IReviewRepository {
  create(data: Partial<IReview>): Promise<IReview>;
  findById(id: string): Promise<IReview | null>;
  findOne(filter: any): Promise<IReview | null>;
  find(filter: any, options?: { limit?: number; skip?: number; sort?: any }): Promise<IReview[]>;
  update(id: string, data: Partial<IReview>): Promise<IReview | null>;
  delete(id: string): Promise<IReview | null>;
  deleteMany(filter: any): Promise<{ deletedCount: number }>;
  count(filter: any): Promise<number>;
  findByProduct(productId: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IReview[]>;
  findByUser(userId: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IReview[]>;
  findByProductAndUser(productId: string, userId: string): Promise<IReview | null>;
  findByStatus(status: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IReview[]>;
  getReviewSummary(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: string]: number };
  }>;
  getReviewSummaries(productIds: string[]): Promise<Map<string, {
    averageRating: number;
    totalReviews: number;
  }>>;
}