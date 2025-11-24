# Pulse Social - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in Vercel:

```bash
# Late API
LATE_MASTER_API_KEY=sk_8df0f8a562160cf0bb0dcec76a546a734b720bae3123743bf098af6521facaf5

# NextAuth
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://yourdomain.com

# Database (Supabase Production)
DATABASE_URL=postgresql://...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=[from Vercel Blob dashboard]
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN=[same as above]

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Cron Jobs
CRON_SECRET=[generate with: openssl rand -base64 32]

# OAuth (Production)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 2. Stripe Setup

1. Switch to Live Mode in Stripe Dashboard
2. Create Products with these exact Price IDs:
   - `price_essentials_monthly` - $15/month
   - `price_pro_monthly` - $39/month
   - `price_business_monthly` - $99/month
   - `price_addon_reddit` - $19/month
   - `price_addon_linkedin` - $19/month
   - `price_addon_analytics` - $25/month

3. Set up Webhook:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`, `checkout.session.completed`
   - Copy webhook secret to environment variables

### 3. Supabase Production Database

1. Create production project at supabase.com
2. Copy connection string
3. Run migrations:
   ```bash
   npx prisma db push
   ```

### 4. Vercel Blob Storage

1. Go to Vercel Dashboard > Storage > Create Blob Store
2. Copy the token to environment variables

### 5. Google OAuth (Optional)

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID and Secret

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Push code to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Import your repository
5. Add all environment variables
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Post-Deployment Tasks

### 1. Verify Deployment

- [ ] Visit your production URL
- [ ] Test sign up flow
- [ ] Test onboarding and platform connections
- [ ] Test Stripe checkout (use test card: 4242 4242 4242 4242)
- [ ] Test post creation
- [ ] Verify webhooks are working

### 2. Security Hardening

- [ ] Rotate Late API key if needed
- [ ] Set up rate limiting (Vercel Edge Config)
- [ ] Enable Vercel Web Application Firewall
- [ ] Set up monitoring (Vercel Analytics + Sentry)
- [ ] Configure CORS policies
- [ ] Enable HTTPS only

### 3. Monitoring Setup

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 4. Domain Configuration

1. Add custom domain in Vercel
2. Update DNS records
3. Update `NEXTAUTH_URL` environment variable
4. Update Stripe webhook URL
5. Update Google OAuth redirect URIs

### 5. Cron Jobs Verification

Vercel Crons are automatically configured via `vercel.json`:
- Monthly reset: 1st of each month at midnight
- Trial expiry check: Daily at midnight

Verify in Vercel Dashboard > Cron Jobs

## Testing Checklist

### Authentication
- [ ] Sign up with email
- [ ] Sign in with email
- [ ] Sign in with Google
- [ ] Password reset

### Onboarding
- [ ] Profile creation
- [ ] Platform connection invites
- [ ] Connection status polling

### Posting
- [ ] Create immediate post
- [ ] Schedule post for later
- [ ] Add to queue
- [ ] Upload media files
- [ ] Multi-platform posting

### Payments
- [ ] Stripe checkout
- [ ] Subscription activation
- [ ] Trial period
- [ ] Webhook processing
- [ ] Billing portal access

### Limits & Paywalls
- [ ] Free tier limits enforced
- [ ] Premium platform locks (Reddit/LinkedIn)
- [ ] Analytics addon gate
- [ ] Upgrade prompts

### Analytics
- [ ] Dashboard displays correctly
- [ ] Data fetched from Late API
- [ ] Locked for non-subscribers

## Rollback Plan

If issues occur:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific deployment
vercel --prod [deployment-url]
```

## Performance Optimization

1. Enable Vercel Edge Caching
2. Configure ISR for static pages
3. Optimize images with Next.js Image component
4. Enable compression
5. Monitor Core Web Vitals

## Maintenance

### Monthly Tasks
- Review error logs
- Check usage stats
- Monitor API costs (Late API, Stripe)
- Review and optimize database queries

### Quarterly Tasks
- Security audit
- Dependency updates
- Performance review
- User feedback analysis

## Support

- Late API: https://getlate.dev/docs
- Stripe: https://stripe.com/docs
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs

## Emergency Contacts

- Late API Support: [support email]
- Stripe Support: https://support.stripe.com
- Vercel Support: https://vercel.com/support

