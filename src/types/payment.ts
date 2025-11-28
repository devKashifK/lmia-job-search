// Payment-related TypeScript interfaces and types

export type PaymentStatus = 
  | 'PENDING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'CANCELLED'
  | 'EXPIRED';

export interface PaymentRequest {
  amount: number;
  currency: 'INR' | 'CAD';
  planName: string;
  userId: string;
  userEmail?: string;
  userPhone?: string;
}

export interface PhonePePaymentPayload {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  callbackUrl: string;
  mobileNumber?: string;
  paymentInstrument: {
    type: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse?: {
      type: string;
      redirectInfo: {
        url: string;
        method: string;
      };
    };
  };
}

export interface PaymentVerification {
  merchantId: string;
  merchantTransactionId: string;
  transactionId: string;
  amount: number;
  state: PaymentStatus;
  responseCode: string;
  paymentInstrument?: {
    type: string;
  };
}

export interface TransactionRecord {
  id?: string;
  user_id: string;
  merchant_transaction_id: string;
  phonepe_transaction_id?: string;
  amount: number;
  currency: string;
  plan_name: string;
  status: PaymentStatus;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface PaymentStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: PaymentStatus;
    responseCode: string;
    paymentInstrument?: {
      type: string;
    };
  };
}
