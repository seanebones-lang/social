# Pulse Social - Complete Setup Guide

## Quick Start (5 Minutes)

This guide will get you running locally in 5 minutes.

### 1. Install Dependencies

```bash
cd /Users/nexteleven/pulse-social
npm install
```

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier is fine)
3. Wait for the database to be ready (2-3 minutes)
4. Go to Settings > Database
5. Copy the connection string (URI format)
6. Update `.env.local`:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. Initialize Database

```bash
npm run db:generate
npm run db:push
```

### 4. Test Late API Key

```bash
npm run test:key
```

You should see output like:
```
✅ Late API key is WORKING!
Usage Stats:
{
  "postsCreated": 0,
  "postsScheduled": 0,
  ...
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Stripe Setup (Optional for Testing Payments)

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for free
3. Stay in Test Mode

### 2. Create Products

In Stripe Dashboard > Products, create:

**Plans:**
- Name: "Essentials", Price: $15/month, Price ID: `price_essentials_monthly`
- Name: "Pro", Price: $39/month, Price ID: `price_pro_monthly`
- Name: "Business", Price: $99/month, Price ID: `price_business_monthly`

**Add-ons:**
- Name: "Reddit Virality Pack", Price: $19/month, Price ID: `price_addon_reddit`
- Name: "LinkedIn Pro Suite", Price: $19/month, Price ID: `price_addon_linkedin`
- Name: "Analytics Pro", Price: $25/month, Price ID: `price_addon_analytics`

### 3. Get API Keys

1. Go to Developers > API keys
2. Copy Publishable key and Secret key
3. Update `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Set Up Webhook (Local Testing)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
npm run stripe:listen
```

Copy the webhook secret from the output and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Vercel Blob Setup (Optional for File Uploads)

### 1. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2. Create Blob Store

1. Go to Storage > Create Database
2. Select "Blob"
3. Create store
4. Copy the token

### 3. Update Environment

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_...
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

## Google OAuth Setup (Optional)

### 1. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials

### 2. Configure OAuth

- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### 3. Update Environment

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Testing the Application

### 1. Create Account

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter name, email, password
4. Click "Create Account"

### 2. Complete Onboarding

1. Profile is auto-created
2. Click on platforms to connect (opens Late invite URLs)
3. Authorize each platform
4. Wait for connection status to update
5. Click "Continue to Dashboard"

### 3. Create Your First Post

1. Enter content in the composer
2. Select platforms
3. Upload media (optional)
4. Click "Post Now" or "Schedule"

### 4. Test Stripe Checkout

1. Go to Pricing page
2. Select a plan
3. Click "Start Free Trial"
4. Use test card: `4242 4242 4242 4242`
5. Any future date, any CVC

### 5. Test Paywalls

1. Try to select Reddit or LinkedIn without addon
2. Should show upgrade modal
3. Try to exceed post limits
4. Should show upgrade modal

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database
npx prisma db push --force-reset
```

### Late API Issues

```bash
# Test key
npm run test:key

# Check environment
echo $LATE_MASTER_API_KEY
```

### Stripe Webhook Issues

```bash
# Check webhook is running
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook
stripe trigger checkout.session.completed
```

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run dev
```

## Project Structure

```
pulse-social/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth pages (signin, signup)
│   ├── api/                     # API routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── trpc/               # tRPC handler
│   │   ├── stripe/             # Stripe webhook
│   │   └── cron/               # Cron jobs
│   ├── dashboard/              # Dashboard pages
│   │   ├── page.tsx           # Composer
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── calendar/          # Scheduled posts
│   │   └── settings/          # Account settings
│   ├── onboarding/            # Onboarding flow
│   ├── pricing/               # Pricing page
│   └── page.tsx               # Landing page
├── components/                 # React components
│   └── ui/                    # UI components (shadcn)
├── lib/                       # Utility libraries
│   ├── lateApi.ts            # Late API client
│   ├── stripe.ts             # Stripe config
│   ├── auth.ts               # NextAuth config
│   ├── utils.ts              # Utilities
│   └── trpc/                 # tRPC setup
├── server/                    # Server-side code
│   ├── api/                  # tRPC routers
│   │   ├── root.ts          # Router composition
│   │   └── routers/         # Individual routers
│   │       ├── auth.ts      # Auth operations
│   │       ├── posts.ts     # Post management
│   │       ├── profiles.ts  # Profile/accounts
│   │       ├── stripe.ts    # Payments
│   │       └── analytics.ts # Analytics
│   └── db.ts                # Prisma client
├── prisma/                   # Database
│   └── schema.prisma        # Database schema
├── scripts/                  # Utility scripts
│   └── test-late-key.ts    # API key tester
└── types/                    # TypeScript types
    └── next-auth.d.ts       # NextAuth types
```

## Key Features Implemented

### Authentication
- Email/password sign up and sign in
- Google OAuth integration
- Session management with NextAuth v5
- Protected routes with middleware

### Onboarding
- Automatic Late profile creation
- Platform invite generation
- Real-time connection status polling
- Beautiful UI with progress tracking

### Post Composer
- Multi-platform content creation
- Character count per platform
- Media upload with Vercel Blob
- Schedule or post immediately
- Queue system integration
- Platform-specific settings

### Subscription Management
- Stripe checkout with 7-day trial
- Three pricing tiers
- Premium add-ons (Reddit, LinkedIn, Analytics)
- Usage-based limits
- Automatic billing
- Customer portal access

### Paywalls & Limits
- Free tier: 10 posts/month
- Essentials: 100 posts/month
- Pro: 500 posts/month
- Business: Unlimited
- Platform-specific locks
- Upgrade prompts

### Analytics
- Gated by Analytics Pro addon
- Engagement metrics
- Reach and impressions
- Platform breakdown
- 30-day overview

### Automation
- Monthly usage reset (1st of month)
- Trial expiry checks (daily)
- Automatic account locking
- Webhook processing

## Next Steps

1. **Test Locally**: Create posts, test payments, verify webhooks
2. **Connect Real Platforms**: Use the onboarding flow to connect your social accounts
3. **Deploy to Vercel**: Follow DEPLOYMENT.md for production setup
4. **Monitor Usage**: Check Late API usage stats regularly
5. **Customize Branding**: Update colors, logo, and copy for your brand

## Support & Documentation

- **Late API**: https://getlate.dev/docs
- **Stripe**: https://stripe.com/docs
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://prisma.io/docs
- **tRPC**: https://trpc.io/docs

## Security Reminders

1. Never commit `.env.local` to git
2. Rotate API keys before going live
3. Use strong NEXTAUTH_SECRET in production
4. Enable rate limiting in production
5. Set up monitoring and alerts

## You're Ready!

Your Pulse Social platform is now fully set up and ready to use. Start by creating your first post and testing the full workflow.

For production deployment, see `DEPLOYMENT.md`.

Happy posting! 🚀

