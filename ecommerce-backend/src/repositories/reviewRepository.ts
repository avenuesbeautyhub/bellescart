import mongoose from 'mongoose';
import { Review, IReview } from '../models/Review';
import { BaseRepository } from './BaseRepository';
import { IReviewRepository } from '../providers/interfaces/IReviewRepository';

export class ReviewRepository extends BaseRepository<IReview> implements IReviewRepository {
  constructor() {
    super(Review);
  }

  async findByProduct(productId: string, options?: { limit?: number; skip?: number; sort?: any; populate?: string; populateOptions?: any }): Promise<IReview[]> {
    return this.find({ productId }, { ...options, sort: { createdAt: -1, ...options?.sort } });
  }

  async findByUser(userId: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IReview[]> {
    return this.find({ userId }, { ...options, sort: { createdAt: -1, ...options?.sort } });
  }

  async findByProductAndUser(productId: string, userId: string): Promise<IReview | null> {
    return this.findOne({ productId, userId });
  }

  async findByStatus(status: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IReview[]> {
    return this.find({ status }, { ...options, sort: { createdAt: -1, ...options?.sort } });
  }

  async find(filter: any, options?: { limit?: number; skip?: number; sort?: any; populate?: string | any }): Promise<IReview[]> {
    let query = this.model.find(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.skip) {
      query = query.skip(options.skip);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.populate) {
      query = query.populate(options.populate);
    }

    return query;
  }

  async getReviewSummary(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: string]: number };
  }> {
    const pipeline = [
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ];

    const result = await this.model.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      };
    }

    const summary = result[0];
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    // Count ratings
    (summary.ratingDistribution as number[]).forEach(rating => {
      (distribution as any)[rating.toString()]++;
    });

    return {
      averageRating: Math.round(summary.averageRating * 10) / 10,
      totalReviews: summary.totalReviews,
      ratingDistribution: distribution
    };
  }

  async getReviewSummaries(productIds: string[]): Promise<Map<string, {
    averageRating: number;
    totalReviews: number;
  }>> {
    const objectIdIds = productIds.map(id => new mongoose.Types.ObjectId(id));

    const pipeline = [
      { $match: { productId: { $in: objectIdIds }, status: 'approved' } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ];

    const results = await this.model.aggregate(pipeline);

    const summaries = new Map<string, { averageRating: number; totalReviews: number }>();

    // Initialize all products with 0 values
    productIds.forEach(id => {
      summaries.set(id, { averageRating: 0, totalReviews: 0 });
    });

    // Update with actual data
    results.forEach(result => {
      summaries.set(result._id.toString(), {
        averageRating: Math.round(result.averageRating * 10) / 10,
        totalReviews: result.totalReviews
      });
    });

    return summaries;
  }
}