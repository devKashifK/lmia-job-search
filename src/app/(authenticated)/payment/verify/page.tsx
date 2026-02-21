'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PaymentStatusLayout } from '@/components/payment/payment-status-layout';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get('transactionId');

      if (!transactionId) {
        setError('Transaction ID not found');
        setIsVerifying(false);
        return;
      }

      try {
        // Check payment status
        const response = await fetch(`/api/payment/status/${transactionId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Payment verification failed');
        }

        // Check if payment was actually successful
        if (data.status !== 'SUCCESS') {
          router.push(`/payment/failure?transactionId=${transactionId}`);
          return;
        }

        setPaymentData(data);

        // Invalidate credits query to refresh credits display
        queryClient.invalidateQueries({ queryKey: ['credits'] });

        toast.success('Payment successful! Credits have been added to your account.');
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router, queryClient]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-brand-500 mb-4" />
            <p className="text-lg font-medium text-gray-900">Verifying your payment...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your transaction</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Verification Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard/credits')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PaymentStatusLayout
      icon={<CheckCircle2 className="w-12 h-12 text-green-600" />}
      iconBgClass="bg-green-100"
      title="Payment Successful!"
      subtitle="Your payment has been processed successfully"
      gradientClass="from-green-50 via-brand-50 to-white"
      borderColorClass="border-green-200"
    >
      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Transaction ID</span>
          <span className="text-sm font-mono font-medium text-gray-900">
            {paymentData?.transactionId?.substring(0, 16)}...
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount Paid</span>
          <span className="text-sm font-semibold text-green-600">
            ₹{((paymentData?.amount || 0) / 100).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {paymentData?.status}
          </span>
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Credits have been added to your account and you can start using them right away!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => router.push('/dashboard/credits')}
          className="w-full bg-brand-500 hover:bg-brand-600"
          size="lg"
        >
          View Credits
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          onClick={() => router.push('/search')}
          variant="outline"
          className="w-full"
        >
          Start Searching Jobs
        </Button>
      </div>
    </PaymentStatusLayout>
  );
}
