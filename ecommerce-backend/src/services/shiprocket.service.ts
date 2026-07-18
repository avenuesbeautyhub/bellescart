import axios, { AxiosInstance } from 'axios';

const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';

interface ShiprocketAuthResponse {
  token: string;
}

interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: string;
}

interface ShiprocketOrderRequest {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_first_name?: string;
  billing_last_name?: string;
  billing_phone: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: string;
  length: string;
  breadth: string;
  height: string;
  weight: string;
}

interface ShiprocketOrderResponse {
  order_id: string;
  shipment_id: string;
}

interface ShippingRateRequest {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod: number;
}

interface ShippingRateResponse {
  data: Array<{
    courier_name: string;
    estimated_delivery_days: string;
    rate: number;
    courier_id: number;
  }>;
}

interface AssignCourierRequest {
  shipment_id: string;
  courier_id: number;
}

interface AssignCourierResponse {
  awb_code: string;
  courier_name: string;
  shipment_id: string;
}

interface SchedulePickupRequest {
  shipment_id: string;
}

interface SchedulePickupResponse {
  success: boolean;
  message: string;
}

interface PickupLocation {
  phone_verified: number;
  id: number;
  pickup_location: string;
  address: string;
  address_2: string;
  city: string;
  email: string;
  phone: string;
  seller_name: string;
  state: string;
  country: string;
  status: number;
  pin_code: string;
  lat: string;
  long: string;
  warehouse_code: string | null;
}

interface PickupLocationsResponse {
  data: PickupLocation[];
}

interface TrackingResponse {
  tracking_data: {
    shipment_status: string;
    shipment_track: Array<{
      date: string;
      status: string;
      location: string;
      description: string;
    }>;
  };
}

export class ShiprocketService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SHIPROCKET_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Step 1: Authentication (Login)
   * Call this once every 10 days to get a fresh token
   */
  async login(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const email = process.env.SHIPROCKET_EMAIL;
      const password = process.env.SHIPROCKET_PASSWORD;

      if (!email || !password) {
        return {
          success: false,
          error: 'Shiprocket credentials not configured',
        };
      }

      const response = await this.axiosInstance.post<ShiprocketAuthResponse>(
        '/auth/login',
        { email, password }
      );

      this.token = response.data.token;
      // Token is valid for 10 days
      this.tokenExpiry = Date.now() + 10 * 24 * 60 * 60 * 1000;

      // Update axios instance with new token
      this.axiosInstance.defaults.headers.Authorization = `Bearer ${this.token}`;

      return {
        success: true,
        token: this.token,
      };
    } catch (error: any) {
      console.error('Shiprocket login error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to authenticate with Shiprocket',
      };
    }
  }

  /**
   * Ensure we have a valid token
   */
  private async ensureAuthenticated(): Promise<boolean> {
    // Check if token exists and is not expired
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return true;
    }

    // Get new token
    const result = await this.login();
    return result.success;
  }

  /**
   * Fetch available pickup locations from Shiprocket
   */
  async getPickupLocations(): Promise<{
    success: boolean;
    locations?: PickupLocation[];
    error?: string;
  }> {
    try {
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }

      const response = await this.axiosInstance.get<PickupLocationsResponse>(
        '/settings/company/pickup-locations'
      );

      console.log('📍 Available pickup locations:', JSON.stringify(response.data, null, 2));

      return {
        success: true,
        locations: response.data.data,
      };
    } catch (error: any) {
      console.error('Shiprocket get pickup locations error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pickup locations',
      };
    }
  }

  /**
   * Check courier serviceability for a specific route
   */
  async checkCourierServiceability(deliveryPincode: string, weight: number = 0.5): Promise<{
    success: boolean;
    serviceable?: boolean;
    availableCouriers?: any[];
    error?: string;
  }> {
    try {
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }

      const response = await this.axiosInstance.get('/courier/serviceability', {
        params: {
          pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE,
          delivery_postcode: deliveryPincode,
          weight: weight,
          cod: 0,
        },
      });

      console.log('🚚 Courier serviceability response:', JSON.stringify(response.data, null, 2));

      return {
        success: true,
        serviceable: true,
        availableCouriers: response.data?.data || [],
      };
    } catch (error: any) {
      console.error('Shiprocket check courier serviceability error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check courier serviceability',
      };
    }
  }

  /**
   * Step 2: Create Order
   * Call this when payment succeeds
   */
  async createOrder(orderData: ShiprocketOrderRequest): Promise<{
    success: boolean;
    orderId?: string;
    shipmentId?: string;
    error?: string;
  }> {
    try {
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }

      const response = await this.axiosInstance.post<ShiprocketOrderResponse>(
        '/orders/create/adhoc',
        orderData
      );

      console.log('📦 Shiprocket create order response:', JSON.stringify(response.data, null, 2));

      // Handle different response structures
      const responseData = response.data as any;

      // Check if Shiprocket returned an error message
      if (responseData.message && !responseData.order_id && !responseData.shipment_id) {
        console.error('❌ Shiprocket API error:', responseData.message);
        return {
          success: false,
          error: responseData.message,
        };
      }

      // Shiprocket sometimes returns data wrapped in a data property
      const data = responseData.data || responseData;
      const orderId = data.order_id || data.orderId || data.id;
      const shipmentId = data.shipment_id || data.shipmentId;

      if (!orderId || !shipmentId) {
        console.error('❌ Missing required fields in Shiprocket response:', {
          orderId,
          shipmentId,
          fullResponse: responseData
        });
        return {
          success: false,
          error: 'No order_id or shipment_id in Shiprocket response',
        };
      }

      return {
        success: true,
        orderId,
        shipmentId,
      };
    } catch (error: any) {
      console.error('Shiprocket create order error:', error.response?.data || error.message);
      console.error('Full error details:', JSON.stringify(error.response?.data, null, 2));
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to create Shiprocket order',
      };
    }
  }

  /**
   * Step 3: Shipping Rate Calculation
   * Call this before creating shipment to get available couriers and rates
   */
  async calculateShipping(request: ShippingRateRequest): Promise<{
    success: boolean;
    rates?: Array<{
      courierName: string;
      estimatedDays: string;
      rate: number;
      courierId: number;
    }>;
    error?: string;
  }> {
    try {
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }

      const response = await this.axiosInstance.get<ShippingRateResponse>(
        '/courier/serviceability',
        { params: request }
      );

      console.log('Shiprocket response structure:', JSON.stringify(response.data, null, 2));

      // Handle different response structures
      const responseData = response.data as any;
      let ratesArray = [];

      if (Array.isArray(responseData.data)) {
        ratesArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        ratesArray = responseData;
      } else if (responseData.data?.available_courier_companies) {
        // Shiprocket returns rates in available_courier_companies array
        ratesArray = responseData.data.available_courier_companies;
      }

      const rates = ratesArray.map((rate: any) => ({
        courierName: rate.courier_name || rate.courierName,
        estimatedDays: rate.estimated_delivery_days || rate.estimatedDays,
        rate: rate.rate,
        courierId: rate.courier_company_id || rate.courier_id || rate.courierId,
        cod: rate.cod === 1 || rate.cod === true,
        codCharges: rate.cod_charges || 0,
        // Include availability information
        availability: {
          suppressDate: rate.suppress_date || null,
          cutoffTime: rate.cutoff_time || null,
          pickupAvailability: rate.pickup_availability || null,
          secondsLeftForPickup: rate.seconds_left_for_pickup || null,
          blocked: rate.blocked || 0,
          recommended: rate.recommended_by || null,
        },
      }));

      return {
        success: true,
        rates,
      };
    } catch (error: any) {
      console.error('Shiprocket calculate shipping error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || 'Failed to calculate shipping rates',
      };
    }
  }

  /**
   * Step 4: Generate Shipment (Assign Courier)
   * Call this after customer confirms courier
   */
  async assignCourier(request: AssignCourierRequest): Promise<{
    success: boolean;
    awb?: string;
    courier?: string;
    shipmentId?: string;
    error?: string;
  }> {
    try {
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }

      const response = await this.axiosInstance.post<AssignCourierResponse>(
        '/courier/assign/awb',
        request
      );

      console.log('🚚 Shiprocket assign courier response:', JSON.stringify(response.data, null, 2));

      // Handle different response structures
      const responseData = response.data as any;

      // Check for Shiprocket error responses
      if (responseData.status_code && responseData.status_code !== 200) {
        const errorMessage = responseData.message || responseData.response?.data?.awb_assign_error || 'Courier assignment failed';
        console.error('❌ Shiprocket courier assignment error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Handle nested response structure: response.data.awb_code
      const awb = responseData.response?.data?.awb_code || responseData.awb_code || responseData.awb;
      const courier = responseData.response?.data?.courier_name || responseData.courier_name || responseData.courier;
      const shipmentId = responseData.response?.data?.shipment_id || responseData.shipment_id || responseData.shipmentId;

      if (!awb) {
        console.error('❌ No AWB code returned from courier assignment');
        console.error('Response structure:', JSON.stringify(responseData, null, 2));
        return {
          success: false,
          error: 'No AWB code returned from courier assignment',
        };
      }

      return {
        success: true,
        awb,
        courier,
        shipmentId,
      };
    } catch (error: any) {
      console.error('Shiprocket assign courier error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign courier',
      };
    }
  }

  /**
   * Check if a courier is currently available based on its availability data
   */
  private isCourierAvailable(rate: any): boolean {
    if (!rate.availability) return true; // If no availability data, assume available

    const now = new Date();
    const { availability } = rate;

    // Check if courier is blocked
    if (availability.blocked === 1) {
      console.log(`❌ Courier ${rate.courierName} is blocked`);
      return false;
    }

    // Check if courier is suppressed
    // Only filter if suppressDate is more than 1 day in the future (temporary daily cutoff, not long-term suppression)
    if (availability.suppressDate) {
      const suppressDate = new Date(availability.suppressDate);
      console.log(`📅 ${rate.courierName} suppressDate:`, availability.suppressDate, 'parsed:', suppressDate.toISOString(), 'valid:', !isNaN(suppressDate.getTime()));
      const daysUntilSuppress = (suppressDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      // Only suppress if more than 1 day away (ignore daily cutoffs)
      if (!isNaN(suppressDate.getTime()) && daysUntilSuppress > 1) {
        console.log(`❌ Courier ${rate.courierName} suppressed until ${availability.suppressDate} (${daysUntilSuppress.toFixed(1)} days away)`);
        return false;
      } else if (!isNaN(suppressDate.getTime()) && daysUntilSuppress > 0) {
        console.log(`⚠️ Courier ${rate.courierName} has daily cutoff at ${availability.suppressDate} (${daysUntilSuppress.toFixed(1)} days away) - allowing anyway`);
      }
    }

    // Check cutoff time - ignore this check due to timezone issues with Shiprocket API
    // The cutoff times are likely in IST but compared with UTC, causing false positives
    if (availability.cutoffTime) {
      console.log(`⚠️ Courier ${rate.courierName} has cutoff time (${availability.cutoffTime}) - ignoring due to timezone issues`);
    }

    // Check pickup time window - ignore negative values as they're often temporary
    if (availability.secondsLeftForPickup < 0) {
      console.log(`⚠️ Courier ${rate.courierName} pickup time window expired (${availability.secondsLeftForPickup}s) - allowing anyway (may be temporary)`);
    }

    return true;
  }

  /**
   * Assign courier with fallback - try alternative couriers if the selected one fails
   */
  async assignCourierWithFallback(
    shipmentId: string,
    preferredCourierId: number,
    shippingRequest: ShippingRateRequest,
    allRates?: any[]
  ): Promise<{
    success: boolean;
    awb?: string;
    courier?: string;
    courierId?: number;
    error?: string;
  }> {
    // First try the preferred courier
    console.log('🚚 Trying preferred courier:', preferredCourierId);
    const preferredResult = await this.assignCourier({
      shipment_id: shipmentId,
      courier_id: preferredCourierId,
    });

    if (preferredResult.success) {
      return {
        success: true,
        awb: preferredResult.awb,
        courier: preferredResult.courier,
        courierId: preferredCourierId,
      };
    }

    console.warn('⚠️ Preferred courier failed:', preferredResult.error);
    console.log('🔄 Fetching available couriers for fallback...');

    // Use provided rates if available, otherwise fetch from API
    let shippingResult;
    if (allRates && allRates.length > 0) {
      shippingResult = { success: true, rates: allRates };
      console.log('📋 Using provided rates for fallback:', allRates.map(r => `${r.courierName} (ID: ${r.courierId})`));
    } else {
      shippingResult = await this.calculateShipping(shippingRequest);
    }

    if (!shippingResult.success || !shippingResult.rates || shippingResult.rates.length === 0) {
      return {
        success: false,
        error: `Preferred courier failed and no alternative couriers available: ${preferredResult.error}`,
      };
    }

    console.log('📋 Available couriers from Shiprocket:', shippingResult.rates.map(r => `${r.courierName} (ID: ${r.courierId})`));

    // Filter couriers based on real-time availability (very lenient)
    const trulyAvailableCouriers = shippingResult.rates.filter(rate => {
      const available = this.isCourierAvailable(rate);
      if (!available && rate.courierId !== preferredCourierId) {
        console.log(`⚠️ Skipping unavailable courier: ${rate.courierName}`);
      }
      return available;
    });

    console.log('📋 Actually available couriers after filtering:', trulyAvailableCouriers.map(r => `${r.courierName} (ID: ${r.courierId})`));

    if (trulyAvailableCouriers.length === 0) {
      return {
        success: false,
        error: `No couriers are currently available for this route. Preferred courier error: ${preferredResult.error}`,
      };
    }

    // Try each available courier (excluding the one that already failed)
    for (const rate of trulyAvailableCouriers) {
      if (rate.courierId === preferredCourierId) {
        continue; // Skip the one that already failed
      }

      console.log(`🔄 Trying alternative courier: ${rate.courierName} (ID: ${rate.courierId})`);
      const fallbackResult = await this.assignCourier({
        shipment_id: shipmentId,
        courier_id: rate.courierId,
      });

      if (fallbackResult.success) {
        console.log(`✅ Successfully assigned alternative courier: ${rate.courierName}`);
        return {
          success: true,
          awb: fallbackResult.awb,
          courier: fallbackResult.courier,
          courierId: rate.courierId,
        };
      }

      console.warn(`⚠️ Courier ${rate.courierName} also failed:`, fallbackResult.error);
    }

    // If only one courier was available and it failed, try retrying it after a delay
    // (handles temporary Shiprocket API issues)
    if (shippingResult.rates.length === 1 && shippingResult.rates[0].courierId === preferredCourierId) {
      // Extract detailed courier availability information
      const courierDetails = shippingResult.rates[0] as any;
      console.warn('⚠️ Courier unavailability details:', {
        courier_name: courierDetails.courierName,
        suppress_date: courierDetails.suppress_date,
        cutoff_time: courierDetails.cutoff_time,
        pickup_availability: courierDetails.pickup_availability,
        seconds_left_for_pickup: courierDetails.seconds_left_for_pickup,
        blocked: courierDetails.blocked
      });

      // Provide specific reason for failure
      const failureReasons = [];
      if (courierDetails.suppress_date) {
        failureReasons.push(`Courier suppressed until ${courierDetails.suppress_date}`);
      }
      if (courierDetails.cutoff_time) {
        const now = new Date();
        const cutoff = new Date();
        const [hours, minutes] = courierDetails.cutoff_time.split(':');
        cutoff.setHours(parseInt(hours), parseInt(minutes), 0);
        if (now > cutoff) {
          failureReasons.push(`Cutoff time (${courierDetails.cutoff_time}) has passed`);
        }
      }
      if (courierDetails.pickup_availability === "0") {
        failureReasons.push('Pickup not available at this location');
      }
      if (courierDetails.seconds_left_for_pickup < 0) {
        failureReasons.push('Pickup time window has expired');
      }
      if (courierDetails.blocked === 1) {
        failureReasons.push('Courier is blocked');
      }

      if (failureReasons.length > 0) {
        console.warn('⚠️ Courier unavailability reasons:', failureReasons.join(', '));
      }

      console.warn('⚠️ Only one courier available and it failed. Retrying after 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('🔄 Retrying preferred courier after delay:', preferredCourierId);
      const retryResult = await this.assignCourier({
        shipment_id: shipmentId,
        courier_id: preferredCourierId,
      });

      if (retryResult.success) {
        console.log('✅ Retry successful, AWB:', retryResult.awb);
        return {
          success: true,
          awb: retryResult.awb,
          courier: retryResult.courier,
          courierId: preferredCourierId,
        };
      }

      console.warn('⚠️ Retry also failed:', retryResult.error);
    }

    return {
      success: false,
      error: `All courier assignment attempts failed. Preferred courier error: ${preferredResult.error}`,
    };
  }

  /**
   * Step 5: Schedule Pickup
   * Call this after generating AWB
   */
  async schedulePickup(request: SchedulePickupRequest): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }

      const response = await this.axiosInstance.post<SchedulePickupResponse>(
        '/courier/generate/pickup',
        request
      );

      console.log('📅 Shiprocket schedule pickup response:', JSON.stringify(response.data, null, 2));

      // Handle different response structures
      const responseData = response.data as any;
      const success = responseData.success !== undefined ? responseData.success : true;
      const message = responseData.message || 'Pickup scheduled successfully';

      return {
        success,
        message,
      };
    } catch (error: any) {
      console.error('Shiprocket schedule pickup error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to schedule pickup',
      };
    }
  }

  /**
   * Step 6: Tracking
   * Call this to get shipment tracking status
   */
  async trackOrder(awb: string): Promise<{
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
    try {
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }

      const response = await this.axiosInstance.get<TrackingResponse>(
        `/courier/track/awb/${awb}`
      );

      return {
        success: true,
        trackingData: {
          currentStatus: response.data.tracking_data.shipment_status,
          trackingHistory: response.data.tracking_data.shipment_track,
        },
      };
    } catch (error: any) {
      console.error('Shiprocket track order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to track order',
      };
    }
  }

  /**
   * Complete flow: Create order, calculate shipping, assign courier, schedule pickup
   */
  async processOrderCompleteFlow(
    orderData: ShiprocketOrderRequest,
    shippingRequest: ShippingRateRequest,
    courierId: number,
    allRates?: any[]
  ): Promise<{
    success: boolean;
    shiprocketOrderId?: string;
    shipmentId?: string;
    awb?: string;
    courier?: string;
    error?: string;
  }> {
    try {
      // Step 1: Create Shiprocket Order
      const orderResult = await this.createOrder(orderData);
      console.log('📦 Shiprocket order creation result:', orderResult);

      if (!orderResult.success) {
        return {
          success: false,
          error: orderResult.error,
        };
      }

      if (!orderResult.shipmentId) {
        console.error('❌ No shipment_id returned from order creation');
        return {
          success: false,
          error: 'No shipment ID returned from Shiprocket order creation',
        };
      }

      // Step 2: Calculate Shipping (optional - can be skipped if courier is pre-selected)
      const shippingResult = await this.calculateShipping(shippingRequest);
      if (!shippingResult.success) {
        console.warn('⚠️ Failed to calculate shipping rates, continuing with provided courier:', shippingResult.error);
      } else {
        console.log('✅ Shipping rates calculated successfully');
      }

      // Step 3: Assign Courier (with fallback to alternative couriers)
      console.log('🚚 Assigning courier with shipment_id:', orderResult.shipmentId, 'courier_id:', courierId);
      const assignResult = await this.assignCourierWithFallback(
        orderResult.shipmentId!,
        courierId,
        shippingRequest,
        allRates || shippingResult.rates // Use provided rates or fallback to API
      );

      if (!assignResult.success) {
        return {
          success: false,
          error: assignResult.error,
        };
      }

      console.log('✅ Courier assigned successfully, AWB:', assignResult.awb, 'Courier:', assignResult.courier, 'Courier ID:', assignResult.courierId);

      // Step 4: Schedule Pickup
      const pickupResult = await this.schedulePickup({
        shipment_id: orderResult.shipmentId!,
      });

      if (!pickupResult.success) {
        console.warn('⚠️ Failed to schedule pickup:', pickupResult.error);
      } else {
        console.log('✅ Pickup scheduled successfully');
      }

      return {
        success: true,
        shiprocketOrderId: orderResult.orderId,
        shipmentId: orderResult.shipmentId,
        awb: assignResult.awb,
        courier: assignResult.courier,
      };
    } catch (error: any) {
      console.error('❌ Shiprocket complete flow error:', error.message);
      console.error('Error stack:', error.stack);
      return {
        success: false,
        error: error.message || 'Failed to process Shiprocket order',
      };
    }
  }
}

export const shiprocketService = new ShiprocketService();
