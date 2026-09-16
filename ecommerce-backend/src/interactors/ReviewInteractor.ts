import mongoose from 'mongoose';
import { IReview } from '../models/Review';
import { ReviewRepository } from '../repositories/reviewRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { IReviewInteractor } from '../providers/interfaces/IReviewInteractor';

export class ReviewInteractor implements IReviewInteractor {
  private reviewRepository: ReviewRepository;
  private orderRepository: OrderRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.orderRepository = new OrderRepository();
  }

  async createReview(userId: string, reviewData: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }): Promise<IReview> {
    console.log('[REVIEW INTERACTOR] Creating review for user:', userId, 'product:', reviewData.productId);

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findByProductAndUser(
      reviewData.productId,
      userId
    );

    console.log('[REVIEW INTERACTOR] Existing review check:', existingReview ? 'found' : 'not found');

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Check verified purchase - only allow reviews from verified purchasers
    console.log('[REVIEW INTERACTOR] Checking verified purchase...');
    const isVerifiedPurchase = await this.checkVerifiedPurchase(userId, reviewData.productId);
    console.log('[REVIEW INTERACTOR] Verified purchase check result:', isVerifiedPurchase);

    if (!isVerifiedPurchase) {
      throw new Error('You can only review products you have purchased');
    }

    console.log('[REVIEW INTERACTOR] Creating review in database...');
    const review = await this.reviewRepository.create({
      productId: new mongoose.Types.ObjectId(reviewData.productId),
      userId: new mongoose.Types.ObjectId(userId),
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images || [],
      isVerifiedPurchase,
      status: 'approved' // Auto-approve by default
    });

    console.log('[REVIEW INTERACTOR] Review created successfully:', review._id);
    return review;
  }

  async getReviewsByProduct(productId: string, filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ reviews: any[]; pagination: any }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const status = filters?.status || 'approved';

    console.log('[REVIEW INTERACTOR] Fetching reviews for product:', productId, 'with user population');
    const reviews = await this.reviewRepository.findByProduct(productId, {
      limit,
      skip,
      sort: { createdAt: -1 },
      populate: 'userId',
      populateOptions: { select: 'name email' } // Populate user information with specific fields
    });

    console.log('[REVIEW INTERACTOR] Reviews fetched:', reviews.length);
    console.log('[REVIEW INTERACTOR] First review user data:', reviews[0]?.userId);

    // Transform reviews to include user data in a separate field
    const transformedReviews = reviews.map(review => {
      const plainReview: any = review.toJSON ? review.toJSON() : review.toObject();
      if (plainReview.userId && typeof plainReview.userId === 'object') {
        plainReview.user = plainReview.userId;
        plainReview.userId = plainReview.userId._id;
      }
      return plainReview;
    });

    // Filter by status if specified
    const filteredReviews = status
      ? transformedReviews.filter(review => review.status === status)
      : transformedReviews;

    const total = await this.reviewRepository.count({ productId, status });

    return {
      reviews: filteredReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getReviewsByUser(userId: string, filters?: {
    page?: number;
    limit?: number;
  }): Promise<{ reviews: IReview[]; pagination: any }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const reviews = await this.reviewRepository.findByUser(userId, {
      limit,
      skip
    });

    const total = await this.reviewRepository.count({ userId });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getReviewById(reviewId: string): Promise<IReview | null> {
    return this.reviewRepository.findById(reviewId);
  }

  async updateReview(reviewId: string, userId: string, updateData: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<IReview | null> {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId.toString() !== userId) {
      throw new Error('You can only edit your own reviews');
    }

    return this.reviewRepository.update(reviewId, updateData);
  }

  async deleteReview(reviewId: string, userId: string): Promise<IReview | null> {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId.toString() !== userId) {
      throw new Error('You can only delete your own reviews');
    }

    return this.reviewRepository.delete(reviewId);
  }

  async getReviewEligibility(userId: string, productId: string): Promise<{
    canReview: boolean;
    hasReviewed: boolean;
    isVerifiedPurchase: boolean;
    userReview?: any;
  }> {
    // Check if user already reviewed
    const existingReview = await this.reviewRepository.findByProductAndUser(productId, userId);
    const hasReviewed = !!existingReview;

    // Check verified purchase
    const isVerifiedPurchase = await this.checkVerifiedPurchase(userId, productId);

    // User can review if they haven't reviewed yet and have purchased the product
    const canReview = !hasReviewed && isVerifiedPurchase;

    // Populate user information for the existing review
    let populatedReview = existingReview;
    if (existingReview) {
      const reviewWithUser = await this.reviewRepository.findById(existingReview._id.toString(), { populate: 'userId', populateOptions: { select: 'name email' } });
      if (reviewWithUser) {
        const plainReview: any = reviewWithUser.toJSON ? reviewWithUser.toJSON() : reviewWithUser.toObject();
        if (plainReview.userId && typeof plainReview.userId === 'object') {
          plainReview.user = plainReview.userId;
          plainReview.userId = plainReview.userId._id;
        }
        populatedReview = plainReview;
      }
    }

    return {
      canReview,
      hasReviewed,
      isVerifiedPurchase,
      userReview: populatedReview || undefined
    };
  }

  async getReviewSummary(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: string]: number };
  }> {
    return this.reviewRepository.getReviewSummary(productId);
  }

  async getReviewSummaries(productIds: string[]): Promise<Map<string, {
    averageRating: number;
    totalReviews: number;
  }>> {
    return this.reviewRepository.getReviewSummaries(productIds);
  }

  async updateReviewStatus(reviewId: string, status: 'pending' | 'approved' | 'rejected'): Promise<IReview | null> {
    return this.reviewRepository.update(reviewId, { status });
  }

  async getAllReviews(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    productId?: string;
    userId?: string;
  }): Promise<{ reviews: IReview[]; pagination: any }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (filters?.status) filter.status = filters.status;
    if (filters?.productId) filter.productId = filters.productId;
    if (filters?.userId) filter.userId = filters.userId;

    const reviews = await this.reviewRepository.find(filter, {
      limit,
      skip,
      sort: { createdAt: -1 },
      populate: ['productId', 'userId']
    });

    const total = await this.reviewRepository.count(filter);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private async checkVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
    try {
      console.log('[VERIFIED PURCHASE] Checking for user:', userId, 'product:', productId);
      // Check if user has any delivered order containing this product
      // Using a direct query through the model since OrderRepository doesn't expose a generic find
      const { Order } = await import('../models/Order');
      const orders = await Order.find({
        user: userId,
        status: 'delivered',
        'items.product': productId
      });

      console.log('[VERIFIED PURCHASE] Found delivered orders:', orders.length);
      return orders.length > 0;
    } catch (error) {
      console.error('[VERIFIED PURCHASE] Error checking verified purchase:', error);
      return false;
    }
  }
}