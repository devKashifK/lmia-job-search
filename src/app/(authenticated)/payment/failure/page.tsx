'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PaymentStatusLayout } from '@/components/payment/payment-status-layout';

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [paymentData, setPaymentData] = useState<any>(null);
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    const fetchFailureDetails = async () => {
      if (transactionId) {
        try {
          const response = await fetch(`/api/payment/status/${transactionId}`);
          const data = await response.json();
          setPaymentData(data);
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      }
    };

    fetchFailureDetails();
  }, [transactionId]);

  const getFailureReason = (responseCode?: string) => {
    const reasons: Record<string, string> = {
      'PAYMENT_ERROR': 'Payment processing encountered an error',
      'PAYMENT_DECLINED': 'Payment was declined by your bank',
      'INSUFFICIENT_FUNDS': 'Insufficient funds in your account',
      'TRANSACTION_CANCELLED': 'Transaction was cancelled',
      'PAYMENT_PENDING': 'Payment is still pending',
      'TIMED_OUT': 'Payment session timed out',
    };

    return reasons[responseCode || ''] || 'Payment could not be completed';
  };

  return (
    <PaymentStatusLayout
      icon={<XCircle className="w-12 h-12 text-red-600" />}
      iconBgClass="bg-red-100"
      title="Payment Failed"
      subtitle={getFailureReason(paymentData?.responseCode)}
      gradientClass="from-red-50 via-orange-50 to-white"
      borderColorClass="border-red-200"
    >
      {/* Transaction Details */}
      {transactionId && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Transaction ID</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {transactionId.substring(0, 16)}...
            </span>
          </div>
          {paymentData?.status && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {paymentData.status}
              </span>
            </div>
          )}
        </div>
      )}

      {/* What Next Section */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900">What can you do?</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Check your payment details and try again</li>
              <li>Ensure you have sufficient balance</li>
              <li>Try a different payment method</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => router.push('/pricing')}
          className="w-full bg-brand-500 hover:bg-brand-600"
          size="lg"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>

      {/* Support Link */}
      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Need help?{' '}
          <Link href="/contact" className="text-brand-600 hover:text-brand-700 font-medium">
            Contact Support
          </Link>
        </p>
      </div>
    </PaymentStatusLayout>
  );
}
