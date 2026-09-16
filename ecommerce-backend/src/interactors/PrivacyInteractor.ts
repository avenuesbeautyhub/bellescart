import { IPrivacyInteractor } from '../providers/interfaces/IPrivacyInteractor';
import { IPrivacyPreferenceRepository } from '../providers/interfaces/IPrivacyPreferenceRepository';
import { IPrivacyRequestRepository } from '../providers/interfaces/IPrivacyRequestRepository';
import { IPrivacyPreference } from '../models/PrivacyPreference';
import { IPrivacyRequest, PrivacyRequestStatus } from '../models/PrivacyRequest';
import { UserRepository } from '../repositories/UserRepository';
import { AddressRepository } from '../repositories/AddressRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { createLogger } from '../utils/logger';

const logger = createLogger('PrivacyInteractor');

export class PrivacyInteractor implements IPrivacyInteractor {
  private _privacyPreferenceRepository: IPrivacyPreferenceRepository;
  private _privacyRequestRepository: IPrivacyRequestRepository;
  private _userRepository: UserRepository;
  private _addressRepository: AddressRepository;
  private _orderRepository: OrderRepository;
  private _productRepository: ProductRepository;

  constructor(
    privacyPreferenceRepository: IPrivacyPreferenceRepository,
    privacyRequestRepository: IPrivacyRequestRepository
  ) {
    this._privacyPreferenceRepository = privacyPreferenceRepository;
    this._privacyRequestRepository = privacyRequestRepository;
    this._userRepository = new UserRepository();
    this._addressRepository = new AddressRepository();
    this._orderRepository = new OrderRepository();
    this._productRepository = new ProductRepository();
  }

  async getPreferences(userId: string): Promise<IPrivacyPreference> {
    logger.info('Getting privacy preferences', { userId });
    const preference = await this._privacyPreferenceRepository.findByUserIdOrCreate(userId);
    if (!preference) {
      throw new Error('Failed to create or retrieve privacy preferences');
    }
    return preference;
  }

  async updatePreferences(userId: string, data: Partial<IPrivacyPreference>): Promise<IPrivacyPreference> {
    logger.info('Updating privacy preferences', { userId, data });
    
    // Only allow updating specific fields
    const allowedFields: (keyof IPrivacyPreference)[] = ['marketingEmails'];
    const updateData: Partial<IPrivacyPreference> = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    
    const preference = await this._privacyPreferenceRepository.updateByUserId(userId, updateData);
    if (!preference) {
      throw new Error('Failed to update privacy preferences');
    }
    return preference;
  }

  async requestDataExport(userId: string): Promise<IPrivacyRequest> {
    logger.info('Requesting data export', { userId });
    
    // Check if there's already a pending export request
    const pendingRequests = await this._privacyRequestRepository.findPendingByUserId(userId);
    if (pendingRequests.length > 0) {
      throw new Error('You already have a pending export request. Please wait for it to complete.');
    }
    
    // Create new export request
    const request = await this._privacyRequestRepository.create({
      userId: userId as any, // Type assertion for mongoose ObjectId
      type: 'export',
      status: 'pending',
      requestedAt: new Date()
    });
    
    logger.info('Data export request created', { requestId: request._id, userId });
    
    // Process the export request immediately (can be moved to background job in production)
    try {
      await this.processExportRequest(request._id.toString());
    } catch (error) {
      logger.error('Failed to process export request', { requestId: request._id, error });
      // The error is already handled in processExportRequest
    }
    
    return request;
  }

  async getUserRequests(userId: string): Promise<IPrivacyRequest[]> {
    logger.info('Getting user privacy requests', { userId });
    return await this._privacyRequestRepository.findRecentByUserId(userId, 10);
  }

  async processExportRequest(requestId: string): Promise<void> {
    logger.info('Processing export request', { requestId });
    
    // Update status to processing
    await this._privacyRequestRepository.updateStatus(requestId, 'processing');
    
    try {
      const request = await this._privacyRequestRepository.findOne({ _id: requestId });
      if (!request) {
        throw new Error('Request not found');
      }
      
      // Generate export data
      const exportData = await this.generateExportData(request.userId.toString());
      
      // Update status to completed and store the export data
      await this._privacyRequestRepository.updateStatus(requestId, 'completed', {
        exportDataUrl: JSON.stringify(exportData) // In production, this would be a cloud storage URL
      });
      
      logger.info('Export request completed successfully', { requestId });
    } catch (error) {
      logger.error('Export request failed', { requestId, error });
      await this._privacyRequestRepository.updateStatus(requestId, 'failed', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getExportData(userId: string, requestId: string): Promise<any> {
    logger.info('Getting export data', { userId, requestId });
    
    const request = await this._privacyRequestRepository.findByIdAndUserId(requestId, userId);
    if (!request) {
      throw new Error('Request not found');
    }
    
    if (request.status !== 'completed') {
      throw new Error('Export request is not completed yet');
    }
    
    if (!request.exportDataUrl) {
      throw new Error('Export data not available');
    }
    
    // Parse the stored JSON data
    return JSON.parse(request.exportDataUrl);
  }

  private async generateExportData(userId: string): Promise<any> {
    logger.info('Generating export data', { userId });
    
    // Fetch user data with wishlist populated
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Fetch user with wishlist populated
    const userWithWishlist = await this._userRepository.getWishlist(userId);
    
    // Fetch addresses
    const addresses = await this._addressRepository.find({ userId });
    
    // Fetch orders
    const orders = await this._orderRepository.find({ user: userId });
    
    // Build export DTO - explicitly include only safe data
    const exportData = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        createdAt: user.createdAt
      },
      addresses: addresses.map(addr => ({
        label: addr.label,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country,
        isDefault: addr.isDefault,
        createdAt: addr.createdAt
      })),
      orders: orders.map(order => ({
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        shipping: order.shipping,
        discount: order.discount,
        total: order.total,
        shippingAddress: {
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.zipCode,
          country: order.shippingAddress.country
        },
        items: order.items.map(item => ({
          productId: item.product.toString(),
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      })),
      wishlist: userWithWishlist?.wishlist ? userWithWishlist.wishlist.map((item: any) => ({
        productId: item._id ? item._id.toString() : item.toString(),
        name: item.name || null,
        price: item.price || null,
        addedAt: new Date().toISOString() // Current date as wishlist items don't have individual timestamps
      })) : [],
      privacyPreferences: await this._privacyPreferenceRepository.findByUserId(userId),
      exportedAt: new Date().toISOString()
    };
    
    return exportData;
  }
}
