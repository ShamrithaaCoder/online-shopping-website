# Loom & Line – clothing store (HTML/CSS/JS + Supabase + Razorpay)

## Setup
1. **Database**: run [`supabase/schema.sql`](./supabase/schema.sql) once in the Supabase SQL Editor. Then run [`supabase/seed-catalog.sql`](./supabase/seed-catalog.sql) to add the sample collection of 10 items in each category (40 total) and image URLs. The sample prices are placeholders; replace them with actual prices before selling.
2. **Edge functions**: link the Supabase CLI to your project, then deploy:
   ```
   supabase link --project-ref your-project-ref
   supabase functions deploy create-order
   supabase functions deploy verify-payment
   ```
3. **Payment secrets**: after obtaining Razorpay test credentials, set them as Supabase Edge Function secrets (never put the secret in `config.js`):
   ```
   supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx
   ```
4. **config.js**: set the public `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Add the public Razorpay test Key ID only when checkout is ready.
5. Serve the folder with `npx serve .` and open it. Without Supabase keys, it runs in demo mode. Checkout remains unavailable until Razorpay credentials and functions are configured.

## Test payment
Use Razorpay test mode: card 4111 1111 1111 1111, any future expiry, any CVV; UPI `success@razorpay`.

## Before going live
- Switch to live Razorpay keys.
- Add a Razorpay webhook (`payment.captured`) as a backup so orders mark paid even if the browser closes.
- Restrict CORS origin in the functions to your domain.
- Add stock tracking and an admin role for managing products.
