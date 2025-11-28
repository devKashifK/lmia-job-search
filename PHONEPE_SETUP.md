# PhonePe Payment Gateway - Setup Guide

## 📋 Prerequisites

Before you begin, make sure you have:
- PhonePe Business account with merchant credentials
- Access to your Supabase database
- Node.js and npm installed
- Next.js application running

## 🚀 Quick Setup

### 1. Install Dependencies

Dependencies have been installed automatically. Verify with:
```bash
npm list axios
```

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp env.phonepe.example .env.local
```

Then edit `.env.local` and add your PhonePe credentials:
```env
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=your_actual_merchant_id
PHONEPE_SALT_KEY=your_actual_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=UAT  # Use UAT for testing
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Create Database Table

Run the SQL migration in your Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase_migration_transactions.sql`
3. Execute the SQL query
4. Verify table creation in Table Editor

### 4. Test Local Development

For local testing with PhonePe callbacks, use ngrok:

```bash
# Install ngrok if you haven't
brew install ngrok  # macOS
# or visit https://ngrok.com/download

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update .env.local:
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000/pricing to test the payment flow.

## 🧪 Testing

### Test Payment Flow (Sandbox)

1. Navigate to `/pricing`
2. Select INR currency
3. Click "Get Started" on any paid plan
4. You'll be redirected to PhonePe sandbox
5. Use PhonePe's test credentials:
   - **UPI**: Type any UPI ID and enter OTP `123456`
   - **Card**: Use test card numbers provided by PhonePe

### Test Credentials (PhonePe Sandbox)

PhonePe provides these test options in UAT environment:
- Any UPI ID with OTP: `123456`
- Test cards available in PhonePe sandbox documentation

## 📁 Files Created

### Backend
- `src/types/payment.ts` - TypeScript type definitions
- `src/lib/phonepe.ts` - PhonePe utility functions
- `src/app/api/payment/initiate/route.ts` - Payment initiation API
- `src/app/api/payment/callback/route.ts` - Payment webhook handler
- `src/app/api/payment/status/[transactionId]/route.ts` - Status checker

### Frontend
- `src/components/ui/payment-button.tsx` - Payment button component
- `src/app/(authenticated)/payment/verify/page.tsx` - Success page
- `src/app/(authenticated)/payment/failure/page.tsx` - Failure page
- Modified: `src/app/(unauthenticated)/pricing/page.tsx` - Added payment integration

### Database & Config
- `supabase_migration_transactions.sql` - Database schema
- `env.phonepe.example` - Environment variables template

## 🔒 Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Keep `PHONEPE_SALT_KEY` secret (server-side only)
- [ ] Use HTTPS in production
- [ ] Verify checksums on all PhonePe callbacks
- [ ] Enable Supabase RLS policies (done in migration)
- [ ] Use different credentials for dev/prod

## 🐛 Troubleshooting

### Issue: Payment initiation fails
**Solution**: Check that all environment variables are set correctly in `.env.local`

### Issue: Callback not received
**Solution**: 
- Ensure ngrok is running for local testing
- Check that `NEXT_PUBLIC_APP_URL` matches your ngrok URL
- Verify callback URL is publicly accessible

### Issue: Credits not added after payment
**Solution**: 
- Check Supabase logs for errors
- Verify `credits` table exists with correct schema
- Check `transactions` table for payment status

### Issue: "Invalid checksum" error
**Solution**: Verify your `PHONEPE_SALT_KEY` is correct

## 📝 Next Steps

### Before Production:

1. **Get Production Credentials**
   - Contact PhonePe to activate production access
   - Obtain production merchant ID and salt key

2. **Update Environment**
   ```env
   PHONEPE_ENV=PRODUCTION
   NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   ```

3. **Test Thoroughly**
   - Test all payment scenarios
   - Verify credit addition
   - Test payment failure handling
   - Check transaction history

4. **Deploy**
   - Deploy to Vercel/your hosting platform
   - Set environment variables in hosting platform
   - Test end-to-end with real payments

## 💡 Tips

- Use PhonePe sandbox for all development and testing
- Monitor the `transactions` table in Supabase for debugging
- Check browser console and server logs for errors
- Test with different amounts and plans
- Verify responsive design on mobile devices

## 📞 Support

If you encounter issues:
1. Check PhonePe developer documentation: https://developer.phonepe.com/
2. Review Supabase logs for database errors
3. Check server logs for API errors
4. Verify all environment variables are set correctly

---

**Status**: Implementation Complete ✅  
**Ready for Testing**: Yes  
**Production Ready**: After thorough testing
