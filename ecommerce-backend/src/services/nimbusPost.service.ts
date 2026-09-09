import axios, { AxiosInstance } from 'axios';

const NIMBUS_BASE_URL = process.env.NIMBUS_BASE_URL || 'https://api.nimbuspost.com';
const NIMBUS_API_KEY = process.env.NIMBUS_API_KEY;
const ENABLE_NIMBUSPOST = process.env.ENABLE_NIMBUSPOST === 'true';

interface NimbusAuthResponse {
  token?: string;
  message?: string;
}

interface NimbusAddress {
  name: string;
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  phone: string;
  email?: string;
}

interface NimbusPackageItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface NimbusCreateShipmentRequest {
  order_number: string;
  invoice_number: string;
  invoice_date: string;
  seller_details: {
    name: string;
    phone: string;
    email?: string;
  };
  pickup_address: NimbusAddress;
  return_address: NimbusAddress;
  customer_address: NimbusAddress;
  payment_mode: 'COD' | 'Prepaid';
  product_description: string;
  weight: number;
  dimensions: {
    length: number;
    breadth: number;
    height: number;
  };
  cod_amount?: number;
  total_amount: number;
  items: NimbusPackageItem[];
}

interface NimbusCreateShipmentResponse {
  success: boolean;
  data?: {
    shipment_id: string;
    tracking_id: string;
    airway_bill: string;
    courier_details: {
      name: string;
      id: string;
    };
    shipment_status: string;
  };
  message?: string;
}

interface NimbusServiceabilityRequest {
  pickup_pincode: string;
  delivery_pincode: string;
  weight: number;
  cod: number;
  payment_type: 'COD' | 'PREPAID';
  length?: number;
  width?: number;
  height?: number;
  declared_value?: number;
}

interface NimbusServiceabilityResponse {
  success: boolean;
  data?: {
    serviceable: boolean;
    couriers: Array<{
      courier_id: string;
      courier_name: string;
      estimated_delivery_days: string;
      rate: number;
      cod_supported: boolean;
      cod_charges?: number;
    }>;
  };
  message?: string;
}

interface NimbusTrackingResponse {
  success: boolean;
  data?: {
    current_status: string;
    tracking_events: Array<{
      date: string;
      status: string;
      location: string;
      description: string;
    }>;
  };
  message?: string;
}

interface NimbusCancelShipmentResponse {
  success: boolean;
  message?: string;
}

interface NimbusLabelResponse {
  success: boolean;
  data?: {
    label_url: string;
  };
  message?: string;
}

interface NimbusManifestResponse {
  success: boolean;
  data?: {
    manifest_id: string;
    manifest_url: string;
  };
  message?: string;
}

interface NimbusCourierListResponse {
  success: boolean;
  data?: Array<{
    courier_id: string;
    courier_name: string;
    is_active: boolean;
  }>;
  message?: string;
}

interface NimbusWarehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface NimbusWarehouseListResponse {
  success: boolean;
  data?: NimbusWarehouse[];
  message?: string;
}

interface NimbusCreateWarehouseResponse {
  success: boolean;
  data?: {
    warehouse_id: string;
  };
  message?: string;
}

export class NimbusPostService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    console.log('🔧 NimbusPost Service Configuration:');
    console.log('🔧 Base URL:', NIMBUS_BASE_URL);
    console.log('🔧 API Key:', NIMBUS_API_KEY ? 'configured' : 'MISSING');

    this.axiosInstance = axios.create({
      baseURL: NIMBUS_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Authenticate and get token
   */
  private async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Authenticating with NimbusPost...');
      const response = await axios.post(
        `${NIMBUS_BASE_URL}/v2/auth/login`,
        {
          api_key: NIMBUS_API_KEY,
        }
      );

      if (response.data.success && response.data.data?.token) {
        this.token = response.data.data.token;
        this.axiosInstance.defaults.headers['Authorization'] = this.token;
        console.log('✅ Authentication successful');
        return true;
      } else {
        console.error('❌ Authentication failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Authentication error:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Check serviceability for a pincode
   */
  async checkServiceability(
    pincode: string,
    weight: number = 0.5,
    cod: number = 0
  ): Promise<{
    success: boolean;
    serviceable?: boolean;
    couriers?: any[];
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      // Authenticate first if no token
      if (!this.token) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          return {
            success: false,
            error: 'Authentication failed',
          };
        }
      }

      console.log('🔍 Starting NimbusPost serviceability check for pincode:', pincode);
      console.log('🔍 Weight:', weight, 'COD amount:', cod);

      const pickupPincode = process.env.PICKUP_PINCODE || '691305';
      const paymentType = cod > 0 ? 'COD' : 'PREPAID';

      const requestData: NimbusServiceabilityRequest = {
        pickup_pincode: pickupPincode,
        delivery_pincode: pincode,
        weight: weight,
        cod: cod,
        payment_type: paymentType,
        length: 10,
        width: 10,
        height: 5,
        declared_value: cod,
      };

      console.log('📦 Request data:', JSON.stringify(requestData));

      const response = await this.axiosInstance.post<NimbusServiceabilityResponse>(
        '/v2/serviceability',
        requestData
      );

      console.log('✅ NimbusPost serviceability response:', response.data);

      if (!response.data.success || !response.data.data) {
        return {
          success: false,
          error: response.data.message || 'Serviceability check failed',
        };
      }

      const couriers = response.data.data.couriers.map((courier) => ({
        courierId: courier.courier_id,
        courierName: courier.courier_name,
        estimatedDays: courier.estimated_delivery_days,
        rate: courier.rate,
        cod: courier.cod_supported,
        codCharges: courier.cod_charges || 0,
      }));

      return {
        success: true,
        serviceable: response.data.data.serviceable,
        couriers,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost serviceability check error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to check serviceability',
      };
    }
  }

  /**
   * Create a shipment
   */
  async createShipment(
    shipmentData: NimbusCreateShipmentRequest
  ): Promise<{
    success: boolean;
    shipmentId?: string;
    trackingId?: string;
    airwayBill?: string;
    courierDetails?: any;
    shipmentStatus?: string;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      // Authenticate first if no token
      if (!this.token) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          return {
            success: false,
            error: 'Authentication failed',
          };
        }
      }

      console.log('📦 Creating NimbusPost shipment:', JSON.stringify(shipmentData, null, 2));

      const response = await this.axiosInstance.post<NimbusCreateShipmentResponse>(
        '/v2/shipments',
        shipmentData
      );

      console.log('✅ NimbusPost create shipment response:', response.data);

      if (!response.data.success || !response.data.data) {
        return {
          success: false,
          error: response.data.message || 'Failed to create shipment',
        };
      }

      return {
        success: true,
        shipmentId: response.data.data.shipment_id,
        trackingId: response.data.data.tracking_id,
        airwayBill: response.data.data.airway_bill,
        courierDetails: response.data.data.courier_details,
        shipmentStatus: response.data.data.shipment_status,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost create shipment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create shipment',
      };
    }
  }

  /**
   * Book existing orders
   */
  async bookShipments(shipmentIds: string[]): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('📦 Booking NimbusPost shipments:', shipmentIds);

      const response = await this.axiosInstance.post('/v2/shipments/book', {
        shipment_ids: shipmentIds,
      });

      console.log('✅ NimbusPost book shipments response:', response.data);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost book shipments error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to book shipments',
      };
    }
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(shipmentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('📦 Cancelling NimbusPost shipment:', shipmentId);

      const response = await this.axiosInstance.post<NimbusCancelShipmentResponse>(
        '/v2/shipments/cancel',
        { shipment_id: shipmentId }
      );

      console.log('✅ NimbusPost cancel shipment response:', response.data);

      if (!response.data.success) {
        return {
          success: false,
          error: response.data.message || 'Failed to cancel shipment',
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost cancel shipment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to cancel shipment',
      };
    }
  }

  /**
   * Request pickup for shipments
   */
  async requestPickup(shipmentIds: string[], pickupDate?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('📦 Requesting NimbusPost pickup for shipments:', shipmentIds);

      const response = await this.axiosInstance.post('/v2/shipments/pickup', {
        shipment_ids: shipmentIds,
        pickup_date: pickupDate,
      });

      console.log('✅ NimbusPost request pickup response:', response.data);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost request pickup error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to request pickup',
      };
    }
  }

  /**
   * Download shipping label
   */
  async downloadLabel(shipmentId: string): Promise<{
    success: boolean;
    labelUrl?: string;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('📦 Downloading NimbusPost label for shipment:', shipmentId);

      const response = await this.axiosInstance.post<NimbusLabelResponse>(
        '/v2/shipments/labels',
        { shipment_ids: [shipmentId] }
      );

      console.log('✅ NimbusPost download label response:', response.data);

      if (!response.data.success || !response.data.data) {
        return {
          success: false,
          error: response.data.message || 'Failed to download label',
        };
      }

      return {
        success: true,
        labelUrl: response.data.data.label_url,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost download label error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to download label',
      };
    }
  }

  /**
   * Generate manifest
   */
  async generateManifest(shipmentIds: string[]): Promise<{
    success: boolean;
    manifestId?: string;
    manifestUrl?: string;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('📦 Generating NimbusPost manifest for shipments:', shipmentIds);

      const response = await this.axiosInstance.post<NimbusManifestResponse>(
        '/v2/shipments/manifest',
        { shipment_ids: shipmentIds }
      );

      console.log('✅ NimbusPost generate manifest response:', response.data);

      if (!response.data.success || !response.data.data) {
        return {
          success: false,
          error: response.data.message || 'Failed to generate manifest',
        };
      }

      return {
        success: true,
        manifestId: response.data.data.manifest_id,
        manifestUrl: response.data.data.manifest_url,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost generate manifest error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to generate manifest',
      };
    }
  }

  /**
   * Track shipment by AWB
   */
  async trackShipment(awb: string): Promise<{
    success: boolean;
    trackingData?: {
      currentStatus: string;
      trackingHistory: Array<{
        date: string;
        status: string;
        location: string;
        description: string;
      }>;
    };
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      // Authenticate first if no token
      if (!this.token) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          return {
            success: false,
            error: 'Authentication failed',
          };
        }
      }

      console.log('🔍 Tracking NimbusPost shipment:', awb);

      const response = await this.axiosInstance.get<NimbusTrackingResponse>(
        `/v2/tracking/${awb}`
      );

      console.log('✅ NimbusPost tracking response:', response.data);

      if (!response.data.success || !response.data.data) {
        return {
          success: false,
          error: response.data.message || 'Failed to track shipment',
        };
      }

      return {
        success: true,
        trackingData: {
          currentStatus: response.data.data.current_status,
          trackingHistory: response.data.data.tracking_events,
        },
      };
    } catch (error: any) {
      console.error('❌ NimbusPost track shipment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to track shipment',
      };
    }
  }

  /**
   * Bulk track shipments
   */
  async trackShipmentsBulk(awbs: string[]): Promise<{
    success: boolean;
    trackingData?: any[];
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('🔍 Bulk tracking NimbusPost shipments:', awbs);

      const response = await this.axiosInstance.post('/v2/tracking/bulk', {
        awbs,
      });

      console.log('✅ NimbusPost bulk tracking response:', response.data);

      return {
        success: true,
        trackingData: response.data.data,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost bulk tracking error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to track shipments',
      };
    }
  }

  /**
   * Get list of couriers
   */
  async getCouriers(): Promise<{
    success: boolean;
    couriers?: Array<{
      courier_id: string;
      courier_name: string;
      is_active: boolean;
    }>;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('📦 Getting NimbusPost couriers list');

      const response = await this.axiosInstance.get<NimbusCourierListResponse>(
        '/v2/couriers'
      );

      console.log('✅ NimbusPost courier list response:', response.data);

      if (!response.data.success || !response.data.data) {
        return {
          success: false,
          error: response.data.message || 'Failed to get couriers',
        };
      }

      const couriers = response.data.data.map((courier) => ({
        courier_id: courier.courier_id,
        courier_name: courier.courier_name,
        is_active: courier.is_active,
      }));

      return {
        success: true,
        couriers,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost get couriers error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get couriers',
      };
    }
  }

  /**
   * Get list of warehouses
   */
  async getWarehouses(): Promise<{
    success: boolean;
    warehouses?: NimbusWarehouse[];
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('🔍 Getting NimbusPost warehouse list');

      const response = await this.axiosInstance.get<NimbusWarehouseListResponse>(
        '/v2/warehouses'
      );

      console.log('✅ NimbusPost warehouse list response:', response.data);

      if (!response.data.success || !response.data.data) {
        return {
          success: false,
          error: response.data.message || 'Failed to get warehouses',
        };
      }

      return {
        success: true,
        warehouses: response.data.data,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost get warehouses error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get warehouses',
      };
    }
  }

  /**
   * Create a warehouse
   */
  async createWarehouse(warehouseData: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  }): Promise<{
    success: boolean;
    warehouseId?: string;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('📦 Creating NimbusPost warehouse:', warehouseData);

      const response = await this.axiosInstance.post<NimbusCreateWarehouseResponse>(
        '/v2/warehouses',
        warehouseData
      );

      console.log('✅ NimbusPost create warehouse response:', response.data);

      if (!response.data.success || !response.data.data) {
        return {
          success: false,
          error: response.data.message || 'Failed to create warehouse',
        };
      }

      return {
        success: true,
        warehouseId: response.data.data.warehouse_id,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost create warehouse error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create warehouse',
      };
    }
  }

  /**
   * Complete flow: Create shipment for order
   */
  async processOrderCompleteFlow(
    orderData: any,
    shippingRequest: any,
    courierId: string
  ): Promise<{
    success: boolean;
    shipmentId?: string;
    trackingId?: string;
    airwayBill?: string;
    courier?: string;
    error?: string;
  }> {
    // Return error if NimbusPost is disabled
    if (!ENABLE_NIMBUSPOST) {
      console.log('⚠️ NimbusPost is disabled');
      return {
        success: false,
        error: 'Courier service is currently disabled. Orders will be processed manually.',
      };
    }

    try {
      console.log('🚀 Starting NimbusPost integration for order:', orderData.order_id);

      // Prepare NimbusPost shipment data
      const shipmentData: NimbusCreateShipmentRequest = {
        order_number: orderData.order_id,
        invoice_number: orderData.order_id,
        invoice_date: orderData.order_date,
        seller_details: {
          name: process.env.SELLER_NAME || 'BellesCart',
          phone: process.env.SELLER_PHONE || '0000000000',
          email: process.env.SELLER_EMAIL || 'support@bellescart.com',
        },
        pickup_address: {
          name: process.env.SELLER_NAME || 'BellesCart',
          address: process.env.PICKUP_ADDRESS || 'Belles Avenue Fashion Hub, Post office junction',
          city: process.env.PICKUP_CITY || 'Punlalur',
          state: process.env.PICKUP_STATE || 'Kerala',
          country: 'India',
          pin_code: process.env.PICKUP_PINCODE || '691305',
          phone: process.env.SELLER_PHONE || '0000000000',
        },
        return_address: {
          name: process.env.SELLER_NAME || 'BellesCart',
          address: process.env.RETURN_ADDRESS || 'Returns Center',
          city: process.env.RETURN_CITY || 'Mumbai',
          state: process.env.RETURN_STATE || 'Maharashtra',
          country: 'India',
          pin_code: process.env.RETURN_PINCODE || '400001',
          phone: process.env.SELLER_PHONE || '0000000000',
        },
        customer_address: {
          name: orderData.billing_customer_name,
          address: orderData.billing_address,
          city: orderData.billing_city,
          state: orderData.billing_state,
          country: orderData.billing_country,
          pin_code: orderData.billing_pincode,
          phone: orderData.billing_phone,
        },
        payment_mode: orderData.payment_method,
        product_description: orderData.order_items.map((item: any) => item.name).join(', '),
        weight: parseFloat(orderData.weight),
        dimensions: {
          length: parseFloat(orderData.length),
          breadth: parseFloat(orderData.breadth),
          height: parseFloat(orderData.height),
        },
        cod_amount: orderData.payment_method === 'COD' ? parseFloat(orderData.sub_total) : undefined,
        total_amount: parseFloat(orderData.sub_total),
        items: orderData.order_items.map((item: any) => ({
          name: item.name,
          sku: item.sku,
          quantity: item.units,
          price: parseFloat(item.selling_price),
        })),
      };
      // Add courier_id to the request
      (shipmentData as any).courier_id = courierId;

      console.log('📋 NimbusPost shipment data:', JSON.stringify(shipmentData, null, 2));

      // Create shipment
      const result = await this.createShipment(shipmentData);

      if (!result.success) {
        console.error('❌ NimbusPost shipment creation failed:', result.error);
        return {
          success: false,
          error: result.error,
        };
      }

      console.log('✅ NimbusPost shipment created successfully:', result);

      return {
        success: true,
        shipmentId: result.shipmentId,
        trackingId: result.trackingId,
        airwayBill: result.airwayBill,
        courier: result.courierDetails?.name,
      };
    } catch (error: any) {
      console.error('❌ NimbusPost complete flow error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to process NimbusPost order',
      };
    }
  }
}

export const nimbusPostService = new NimbusPostService();
