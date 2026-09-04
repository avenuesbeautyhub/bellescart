import { IOrderInteractor } from '../providers/interfaces/IOrderInteractor';
import { IOrderRepository } from '../providers/interfaces/IOrderRepository';
import { ICartRepository } from '../providers/interfaces/ICartRepository';
import { IProductRepository } from '../providers/interfaces/IProductRepository';
import { IUserRepository } from '../providers/interfaces/IUserRepository';
import { Order, IOrder } from '../models/Order';
import { ICart } from '../models/Cart';
import { sendOrderConfirmationEmail } from '../utils/emailService';
import { nimbusPostService } from '../services/nimbusPost.service';
import { paymentService } from '../services/paymentService';
import { Payment } from '../models/Payment';

export class OrderInteractor implements IOrderInteractor {
  private _orderRepository: IOrderRepository;
  private _cartRepository: ICartRepository;
  private _productRepository: IProductRepository;
  private _userRepository: IUserRepository;

  constructor(
    orderRepository: IOrderRepository,
    cartRepository: ICartRepository,
    productRepository: IProductRepository,
    userRepository: IUserRepository
  ) {
    this._orderRepository = orderRepository;
    this._cartRepository = cartRepository;
    this._productRepository = productRepository;
    this._userRepository = userRepository;
  }

  async createOrder(userId: string, orderData: {
    shippingAddress: IOrder['shippingAddress'];
    billingAddress?: IOrder['billingAddress'];
    paymentMethod: IOrder['paymentMethod'];
    notes?: string;
    processNimbus?: boolean;
    nimbusCourierId?: string;
    calculatedShippingFee?: number;
  }): Promise<IOrder> {
    console.log('🛒 createOrder called with data:', {
      userId,
      processNimbus: orderData.processNimbus,
      nimbusCourierId: orderData.nimbusCourierId,
      calculatedShippingFee: orderData.calculatedShippingFee
    });
    // Get user's cart
    const cart = await this._cartRepository.findByUserWithProducts(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];
    let totalWeight = 0;

    for (const cartItem of cart.items) {
      const product = (cartItem.product as any);

      // Check stock
      if (product.quantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        total: cartItem.total
      });

      subtotal += cartItem.total;
      const defaultWeight = parseFloat(process.env.DEFAULT_PRODUCT_WEIGHT || '0.070');
      totalWeight += (product.weight || defaultWeight) * cartItem.quantity; // Default weight 70g (0.070kg) if not specified
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    // Use calculated shipping fee from Shypfy if provided, otherwise use default logic
    const shipping = orderData.calculatedShippingFee !== undefined
      ? orderData.calculatedShippingFee
      : (subtotal > 100 ? 0 : 10); // Free shipping over $100
    const discount = cart.couponDiscount || 0; // Apply coupon discount
    const total = subtotal + tax + shipping - discount;

    // Generate order number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${year}${month}${day}-${random}`;

    // Create order
    const order = new Order({
      user: userId,
      orderNumber,
      items: orderItems,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      notes: orderData.notes
    });

    await order.save();

    // Create or link payment record with order
    try {
      if (orderData.paymentMethod === 'razorpay') {
        // Link existing payment record (created during payment intent)
        const payment = await Payment.findOneAndUpdate(
          { bookingId: orderNumber },
          { order: order._id },
          { new: true }
        );
        if (payment) {
          console.log('💳 Payment record linked to order:', payment._id);
        }
      } else {
        // Create payment record for non-razorpay payment methods
        const payment = await paymentService.createPaymentRecord({
          bookingId: orderNumber,
          amount: total,
          currency: 'INR',
          status: orderData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
          paymentMethod: orderData.paymentMethod,
          userId,
          orderId: order._id.toString(),
          metadata: {
            orderNumber,
            paymentMethod: orderData.paymentMethod
          }
        });
        if (payment.success) {
          console.log('💳 Payment record created for non-razorpay payment:', payment.payment?._id);
        }
      }
    } catch (paymentError) {
      console.error('Failed to create/link payment record with order:', paymentError);
      // Don't fail the order creation if payment record creation fails
    }

    // Update product inventory
    for (const cartItem of cart.items) {
      // Extract product ID (handle both ObjectId and populated object)
      const productId = typeof cartItem.product === 'object' && cartItem.product._id
        ? cartItem.product._id.toString()
        : cartItem.product.toString();

      // Decrease product quantity when order is placed
      await this._productRepository.updateQuantity(productId, cartItem.quantity);
    }
    await this._cartRepository.clearCart(userId);

    let populatedOrder = await order.populate('items.product');

    // Process NimbusPost integration if requested
    if (orderData.processNimbus) {
      try {
        console.log('🚀 Starting NimbusPost integration for order:', orderNumber);
        console.log('📦 Courier ID provided:', orderData.nimbusCourierId);
        console.log('🔑 NimbusPost credentials check:', {
          hasApiKey: !!process.env.NIMBUS_API_KEY,
          hasBaseUrl: !!process.env.NIMBUS_BASE_URL,
        });

        // Validate courier ID
        if (!orderData.nimbusCourierId) {
          console.error('❌ Invalid courier ID provided for NimbusPost:', orderData.nimbusCourierId);
          throw new Error('Invalid courier ID for NimbusPost integration');
        }

        // Prepare NimbusPost order data
        const user = await this._userRepository.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }

        const nimbusOrderData = {
          order_id: orderNumber,
          order_date: date.toISOString().split('T')[0],
          billing_customer_name: user.name || 'Customer',
          billing_phone: user.phone || '0000000000',
          billing_address: orderData.shippingAddress.street,
          billing_city: orderData.shippingAddress.city,
          billing_pincode: orderData.shippingAddress.zipCode,
          billing_state: orderData.shippingAddress.state,
          billing_country: orderData.shippingAddress.country,
          shipping_is_billing: true,
          order_items: orderItems.map((item, index) => {
            const product = (cart.items[index].product as any);
            return {
              name: product.name || 'Product',
              sku: product.sku || `SKU-${index}`,
              units: item.quantity,
              selling_price: item.price.toString()
            };
          }),
          payment_method: (orderData.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Prepaid') as 'COD' | 'Prepaid',
          sub_total: subtotal.toString(),
          length: '10',
          breadth: '10',
          height: '5',
          weight: totalWeight.toString()
        };

        const shippingRequest = {
          pickup_postcode: process.env.PICKUP_PINCODE || '400001',
          delivery_postcode: orderData.shippingAddress.zipCode,
          weight: totalWeight,
          cod: orderData.paymentMethod === 'cash_on_delivery' ? total : 0
        };

        console.log('📋 NimbusPost order data:', JSON.stringify(nimbusOrderData, null, 2));
        console.log('📋 Shipping request:', JSON.stringify(shippingRequest, null, 2));

        // Skip NimbusPost processing - orders will be managed by admin
        console.log('⚠️ Skipping automatic NimbusPost processing - order will be managed by admin');
        console.log('📋 Order created successfully without external courier integration');
      } catch (nimbusError) {
        console.error('❌ NimbusPost integration error:', nimbusError);
        // Don't fail the order creation if NimbusPost fails, but log it
        console.error('Order will be created without NimbusPost integration');
      }
    }

    // Send order confirmation email
    try {
      const user = await this._userRepository.findById(userId);
      if (user && user.email) {
        const orderItems = (populatedOrder.items as any[]).map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }));

        await sendOrderConfirmationEmail(user.email, {
          orderNumber: populatedOrder.orderNumber,
          items: orderItems,
          total: populatedOrder.total,
          shippingAddress: populatedOrder.shippingAddress,
          status: populatedOrder.status
        });
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    return populatedOrder;

  }


  // Clear cart

  async getOrders(userId: string, filters: {
    page?: number;
    limit?: number;
    status?: IOrder['status'];
  } = {}): Promise<{ orders: IOrder[]; pagination: any }> {
    const { page = 1, limit = 10, status } = filters;

    let orders: IOrder[];
    let total: number;

    if (status) {
      orders = await this._orderRepository.getUserOrdersWithStatus(userId, status, {
        limit,
        skip: (page - 1) * limit
      });
      total = await this._orderRepository.count({ user: userId, status });
    } else {
      orders = await this._orderRepository.findByUser(userId, {
        limit,
        skip: (page - 1) * limit
      });
      total = await this._orderRepository.count({ user: userId });
    }

    return {
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  async getAllOrders(filters: {
    page?: number;
    limit?: number;
    status?: IOrder['status'];
  } = {}): Promise<{ orders: IOrder[]; pagination: any }> {
    const { page = 1, limit = 10, status } = filters;

    let orders: IOrder[];
    let total: number;

    if (status) {
      orders = await this._orderRepository.findByStatus(status, {
        limit,
        skip: (page - 1) * limit,
        sort: { createdAt: -1 }
      });
      total = await this._orderRepository.count({ status });
    } else {
      orders = await this._orderRepository.findAll({
        limit,
        skip: (page - 1) * limit,
        sort: { createdAt: -1 }
      });
      total = await this._orderRepository.count({});
    }

    return {
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  async getOrderById(userId: string, orderId: string): Promise<IOrder | null> {
    return this._orderRepository.findByIdWithUserAndPopulate(userId, orderId);
  }

  async getOrderByIdForAdmin(orderId: string): Promise<IOrder | null> {
    return this._orderRepository.findByIdWithPopulate(orderId);
  }

  async updateOrderStatus(orderId: string, status: IOrder['status'], additionalData?: {
    trackingNumber?: string;
    estimatedDelivery?: Date;
  }): Promise<IOrder | null> {
    const updateData: any = { status };

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    return this._orderRepository.updateStatus(orderId, status, updateData);
  }

  async cancelOrder(userId: string, orderId: string): Promise<IOrder | null> {
    const order = await this._orderRepository.findByIdWithUserAndPopulate(userId, orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order can be cancelled
    if (!['delivered', 'shipped'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // Restore inventory (increase quantity)
    for (const item of order.items) {
      // Extract product ID (handle both ObjectId and populated object)
      const productId = typeof item.product === 'object' && item.product._id
        ? item.product._id.toString()
        : item.product.toString();

      await this._productRepository.updateQuantity(productId, item.quantity);
    }

    // Update order status
    return this._orderRepository.updateStatus(orderId, 'cancelled');
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return this._orderRepository.findByOrderNumber(orderNumber);
  }

  async getOrdersByStatus(status: IOrder['status'], options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ orders: IOrder[]; pagination: any }> {
    const { page = 1, limit = 10 } = options;

    const orders = await this._orderRepository.findByStatus(status, {
      limit,
      skip: (page - 1) * limit
    });

    const total = await this._orderRepository.count({ status });

    return {
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<IOrder[]> {
    return this._orderRepository.getOrdersByDateRange(startDate, endDate);
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    return this._orderRepository.getRevenueByDateRange(startDate, endDate);
  }

  async getOrderStats(): Promise<any> {
    return this._orderRepository.getOrderStats();
  }

  async getTopSellingProducts(limit: number = 10): Promise<any[]> {
    return this._orderRepository.getTopSellingProducts(limit);
  }

  async getMonthlyRevenue(year: number): Promise<any[]> {
    return this._orderRepository.getMonthlyRevenue(year);
  }

  async processRefund(orderId: string, refundData: {
    reason: string;
    amount?: number;
    items?: Array<{ productId: string; quantity: number }>;
  }): Promise<IOrder | null> {
    const order = await this._orderRepository.findByIdWithPopulate(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order can be refunded
    if (!['delivered', 'shipped'].includes(order.status)) {
      throw new Error('Order cannot be refunded at this stage');
    }

    // Restore inventory for refunded items
    if (refundData.items) {
      for (const item of refundData.items) {
        await this._productRepository.updateQuantity(item.productId, item.quantity);
      }
    }

    // Update payment record if Razorpay payment
    if (order.paymentMethod === 'razorpay') {
      try {
        const payment = await Payment.findOne({ order: orderId });
        if (payment && payment.razorpayPaymentId) {
          await paymentService.refundPayment(payment.razorpayPaymentId, refundData.amount);
        }
      } catch (paymentError) {
        console.error('Failed to process Razorpay refund:', paymentError);
        // Don't fail the refund process if Razorpay refund fails
      }
    }

    // Update order status
    const updateData = {
      status: 'refunded' as const,
      paymentStatus: 'refunded' as const
    };

    return this._orderRepository.updateStatus(orderId, 'refunded', updateData);
  }

  async updateTrackingInfo(orderId: string, trackingData: {
    trackingNumber: string;
    estimatedDelivery?: Date;
  }): Promise<IOrder | null> {
    return this._orderRepository.updateStatus(orderId, 'shipped', {
      trackingNumber: trackingData.trackingNumber,
      estimatedDelivery: trackingData.estimatedDelivery
    });
  }

  async getUserOrderHistory(userId: string, options: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{ orders: IOrder[]; pagination: any }> {
    const { page = 1, limit = 10, startDate, endDate } = options;

    const query: any = { user: userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    // Use base repository find method
    const orders = await this._orderRepository.find(query, {
      limit,
      skip: (page - 1) * limit,
      sort: { createdAt: -1 }
    });

    const total = await this._orderRepository.count(query);

    return {
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  async retryNimbusIntegration(orderId: string, courierId: string): Promise<{
    success: boolean;
    shipmentId?: string;
    trackingId?: string;
    airwayBill?: string;
    courier?: string;
    error?: string;
  }> {
    try {
      console.log('🔄 Retrying NimbusPost integration for order:', orderId);

      const order = await this._orderRepository.findByIdWithPopulate(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      // Check if order already has NimbusPost integration
      if (order.nimbus?.airwayBill) {
        return {
          success: false,
          error: 'Order already has NimbusPost integration'
        };
      }

      // Get user
      const user = await this._userRepository.findById(order.user.toString());
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Calculate total weight
      let totalWeight = 0;
      const defaultWeight = parseFloat(process.env.DEFAULT_PRODUCT_WEIGHT || '0.070');
      for (const item of order.items) {
        const product = (item.product as any);
        totalWeight += (product.weight || defaultWeight) * item.quantity;
      }

      // Prepare NimbusPost order data
      const date = new Date();

      const nimbusOrderData = {
        order_id: order.orderNumber,
        order_date: date.toISOString().split('T')[0],
        billing_customer_name: user.name || 'Customer',
        billing_phone: user.phone || '0000000000',
        billing_address: order.shippingAddress.street,
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.zipCode,
        billing_state: order.shippingAddress.state,
        billing_country: order.shippingAddress.country,
        shipping_is_billing: true,
        order_items: order.items.map((item: any, index: number) => {
          const product = item.product;
          return {
            name: product.name || 'Product',
            sku: product.sku || `SKU-${index}`,
            units: item.quantity,
            selling_price: item.price.toString()
          };
        }),
        payment_method: (order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Prepaid') as 'COD' | 'Prepaid',
        sub_total: order.subtotal.toString(),
        length: '10',
        breadth: '10',
        height: '5',
        weight: totalWeight.toString()
      };

      const shippingRequest = {
        pickup_postcode: process.env.PICKUP_PINCODE || '400001',
        delivery_postcode: order.shippingAddress.zipCode,
        weight: totalWeight,
        cod: order.paymentMethod === 'cash_on_delivery' ? order.total : 0
      };

      console.log('📋 NimbusPost order data for retry:', JSON.stringify(nimbusOrderData, null, 2));
      console.log('📋 Shipping request for retry:', JSON.stringify(shippingRequest, null, 2));

      // Process complete NimbusPost flow
      const nimbusResult = await nimbusPostService.processOrderCompleteFlow(
        nimbusOrderData,
        shippingRequest,
        courierId
      );

      console.log('📦 NimbusPost retry result:', JSON.stringify(nimbusResult, null, 2));

      if (nimbusResult.success) {
        // Update order with NimbusPost details
        await this._orderRepository.updateStatus(orderId, order.status, {
          nimbus: {
            shipmentId: nimbusResult.shipmentId,
            trackingId: nimbusResult.trackingId,
            airwayBill: nimbusResult.airwayBill,
            courier: nimbusResult.courier,
            shipmentStatus: 'Processing',
          },
          trackingNumber: nimbusResult.airwayBill,
        });
        console.log('✅ NimbusPost integration retry successful:', nimbusResult.shipmentId);
      }

      return nimbusResult;
    } catch (error: any) {
      console.error('❌ NimbusPost retry integration error:', error);
      return {
        success: false,
        error: error.message || 'Failed to retry NimbusPost integration'
      };
    }
  }
}

