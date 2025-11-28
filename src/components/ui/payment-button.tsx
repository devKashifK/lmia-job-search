'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
  amount: number;
  currency: 'INR' | 'CAD';
  planName: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
}

export default function PaymentButton({
  amount,
  currency,
  planName,
  className,
  children = 'Get Started',
  variant = 'default',
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { session } = useSession();
  const router = useRouter();

  const handlePayment = async () => {
    // Check if user is authenticated
    if (!session?.user?.id) {
      toast.error('Please sign in to purchase credits');
      router.push('/sign-in');
      return;
    }

    // Check currency support
    if (currency !== 'INR') {
      toast.error('PhonePe currently supports INR payments only. Please switch to INR currency.');
      return;
    }

    setIsProcessing(true);

    try {
      // Call payment initiation API
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          planName,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      // Show success message
      toast.success('Redirecting to payment gateway...');

      // Redirect to PhonePe payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className={className}
      variant={variant}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
