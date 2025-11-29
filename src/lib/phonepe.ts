import crypto from 'crypto';
import axios from 'axios';
import { PaymentResponse, PaymentStatusResponse, PhonePePaymentPayload } from '@/types/payment';

// PhonePe Configuration
const PHONEPE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID!,
  merchantId: process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID || process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID!, // Fallback to Client ID if Merchant ID not set
  clientSecret: process.env.PHONEPE_CLIENT_SECRET!,
  clientVersion: process.env.PHONEPE_CLIENT_VERSION || '1',
  env: process.env.PHONEPE_ENV || 'UAT',
  // V2 Endpoints
  uatUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  // UPDATED: Correct Production Base URL for v2 Standard Checkout
  prodUrl: 'https://api.phonepe.com/apis/pg', 
  uatAuthUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
  prodAuthUrl: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
};

// Get base URL based on environment
const getBaseUrl = (): string => {
  return PHONEPE_CONFIG.env === 'PRODUCTION' 
    ? PHONEPE_CONFIG.prodUrl 
    : PHONEPE_CONFIG.uatUrl;
};

// Get Auth URL based on environment
const getAuthUrl = (): string => {
  return PHONEPE_CONFIG.env === 'PRODUCTION'
    ? PHONEPE_CONFIG.prodAuthUrl
    : PHONEPE_CONFIG.uatAuthUrl;
};

/**
 * Generate Auth Token for PhonePe v2 API
 * Uses Client Credentials Grant
 */
export const getAuthToken = async (): Promise<string> => {
  try {
    const authUrl = getAuthUrl();
    const clientId = PHONEPE_CONFIG.clientId;
    const clientSecret = PHONEPE_CONFIG.clientSecret;
    const clientVersion = PHONEPE_CONFIG.clientVersion;

    console.log('Generating Auth Token...');
    console.log('Auth URL:', authUrl);
    
    // Construct CURL command for debugging
    const curlCommand = `curl -X POST "${authUrl}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=${clientId}" \\
  -d "client_secret=${clientSecret}" \\
  -d "client_version=${clientVersion}"`;
    
    console.log('--- TRY RUNNING THIS CURL COMMAND ---');
    console.log(curlCommand);
    console.log('-------------------------------------');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('client_version', clientVersion);

    const response = await axios.post(authUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data && response.data.access_token) {
      console.log('Auth Token generated successfully');
      return response.data.access_token;
    }

    throw new Error('No access token received');
  } catch (error: any) {
    console.error('PhonePe Auth Token Error:', error.response?.data || error.message);
    throw new Error('Failed to generate PhonePe auth token: ' + (error.response?.data?.message || error.message));
  }
};

/**
 * Initiate payment with PhonePe v2 (Standard Checkout)
 */
export const initiatePayment = async (
  payload: PhonePePaymentPayload
): Promise<PaymentResponse> => {
  try {
    const baseUrl = getBaseUrl();
    const endpoint = '/checkout/v2/pay'; // Standard Checkout v2 endpoint
    
    console.log('Initiating Payment...');
    console.log('Endpoint:', baseUrl + endpoint);
    
    // Get Auth Token
    const authToken = await getAuthToken();
    
    console.log('Sending JSON Payload...');

    // Make API request with Auth Token
    const response = await axios.post<PaymentResponse>(
      `${baseUrl}${endpoint}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${authToken}`, // O-Bearer is specific to PhonePe
          'X-CLIENT-ID': PHONEPE_CONFIG.clientId,
        },
      }
    );
    
    console.log('Payment Initiation Response:', JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    console.error('PhonePe payment initiation error:', error.response?.data || error.message);
    // Log full error details for debugging
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Data:', JSON.stringify(error.response.data));
    }
    throw new Error(
      error.response?.data?.message || 'Failed to initiate payment'
    );
  }
};

/**
 * Check payment status (v2)
 */
export const checkPaymentStatus = async (
  merchantTransactionId: string
): Promise<PaymentStatusResponse> => {
  try {
    const baseUrl = getBaseUrl();
    const endpoint = `/checkout/v2/order/${merchantTransactionId}/status`; // v2 status endpoint
    
    // Get Auth Token
    const authToken = await getAuthToken();
    
    // Make API request
    const response = await axios.get<PaymentStatusResponse>(
      `${baseUrl}${endpoint}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${authToken}`,
          'X-CLIENT-ID': PHONEPE_CONFIG.clientId,
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('PhonePe status check error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to check payment status'
    );
  }
};

/**
 * Generate unique merchant transaction ID
 */
export const generateTransactionId = (userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `TXN_${userId.substring(0, 8)}_${timestamp}_${random}`.toUpperCase();
};

/**
 * Get credit amount based on plan name
 */
export const getPlanCredits = (planName: string): number => {
  const creditMapping: Record<string, number> = {
    'Pay-as-you-go': 1,
    'Weekly Plan': 50,
    'Monthly Plan': 200,
  };
  
  return creditMapping[planName] || 0;
};

/**
 * Format amount to paise
 */
export const formatAmountToPaise = (amount: number): number => {
  return Math.round(amount * 100);
};

// Export config for use in other files if needed
export const phonePeConfig = PHONEPE_CONFIG;
