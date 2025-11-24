# Pulse Social - Social Media Scheduling Platform

A complete white-label social media scheduling SaaS with Stripe payments and Late API integration.

## Features

- Multi-platform posting (Instagram, TikTok, X, Facebook, YouTube, LinkedIn, Threads, Pinterest, Reddit, Bluesky)
- Subscription management with Stripe
- Usage-based paywalls
- Premium add-ons (Reddit, LinkedIn, Analytics)
- Queue system for optimal posting times
- Analytics dashboard
- 7-day free trial

## Tech Stack

- Next.js 15.1 with App Router
- TypeScript
- Tailwind CSS 4
- tRPC v11
- Prisma 5.22
- NextAuth v5
- Stripe v24
- Vercel Blob
- Late API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file with the following:

```env
# Late API (already configured)
LATE_MASTER_API_KEY=sk_8df0f8a562160cf0bb0dcec76a546a734b720bae3123743bf098af6521facaf5

# NextAuth
NEXTAUTH_SECRET=your-super-long-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy the connection string from Settings > Database
3. Add it to your `.env.local` as `DATABASE_URL`

### 4. Set Up Stripe Products

Create these products in your Stripe Dashboard (Test Mode):

**Plans:**
- Essentials: $15/mo (Price ID: `price_essentials_monthly`)
- Pro: $39/mo (Price ID: `price_pro_monthly`)
- Business: $99/mo (Price ID: `price_business_monthly`)

**Add-ons:**
- Reddit Virality Pack: $19/mo (Price ID: `price_addon_reddit`)
- LinkedIn Pro Suite: $19/mo (Price ID: `price_addon_linkedin`)
- Analytics Pro: $25/mo (Price ID: `price_addon_analytics`)

### 5. Initialize Database

```bash
npm run db:generate
npm run db:push
```

### 6. Test Late API Key

```bash
npm run test:key
```

You should see your usage stats printed to the console.

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Set Up Stripe Webhooks (for local development)

```bash
npm run stripe:listen
```

This will give you a webhook secret. Add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## Project Structure

```
pulse-social/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── onboarding/        # Onboarding flow
│   └── pricing/           # Pricing page
├── components/            # React components
│   └── ui/               # UI components (shadcn)
├── lib/                   # Utility libraries
│   ├── lateApi.ts        # Late API client
│   ├── stripe.ts         # Stripe configuration
│   └── trpc/             # tRPC setup
├── server/                # Server-side code
│   ├── api/              # tRPC routers
│   └── db.ts             # Prisma client
├── prisma/                # Database schema
└── scripts/               # Utility scripts
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test:key` - Test Late API key
- `npm run stripe:listen` - Listen for Stripe webhooks
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Security Notes

**IMPORTANT:** The Late API master key is currently hard-coded for rapid MVP development.

Before deploying to production:

1. Move `LATE_MASTER_API_KEY` to Vercel environment variables
2. Remove it from the codebase
3. Ensure `.env.local` is in `.gitignore`
4. Rotate the key in Late dashboard after launch
5. Set up proper secret management

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

Vercel will automatically:
- Build the Next.js app
- Set up serverless functions
- Configure CDN
- Enable automatic deployments

### Environment Variables for Production

Make sure to set all environment variables in Vercel dashboard:
- `LATE_MASTER_API_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `GOOGLE_CLIENT_ID` (if using Google OAuth)
- `GOOGLE_CLIENT_SECRET` (if using Google OAuth)

## Stripe Webhook Setup (Production)

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
4. Copy webhook secret and add to environment variables

## Support

For issues or questions:
- Late API Documentation: https://getlate.dev/docs
- Stripe Documentation: https://stripe.com/docs
- Next.js Documentation: https://nextjs.org/docs

## License

Proprietary - All rights reserved

