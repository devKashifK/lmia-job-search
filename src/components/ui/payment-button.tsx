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

    setIsProcessing(true);

    try {
      // Call Stripe Checkout API
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency, // Stripe supports multiple currencies, so we can pass 'CAD' or 'INR' directly
          planName,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

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
