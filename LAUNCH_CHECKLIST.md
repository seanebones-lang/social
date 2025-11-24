# 🚀 Pulse Social - Launch Checklist

## ✅ COMPLETED

### Infrastructure
- ✅ Code built and tested locally
- ✅ Pushed to GitHub: https://github.com/seanebones-lang/social
- ✅ Deployed to Vercel: https://pulse-social-d0zh1husd-sean-mcdonnells-projects-4fbf31ab.vercel.app
- ✅ Database connected (Supabase)
- ✅ Build successful (30 seconds)

### Environment Variables
- ✅ STRIPE_SECRET_KEY (Live mode)
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Live mode)
- ✅ STRIPE_WEBHOOK_SECRET (Real secret: whsec_xoIG...)
- ✅ LATE_MASTER_API_KEY (Working)
- ✅ DATABASE_URL (Supabase connected)
- ✅ NEXTAUTH_SECRET (Generated)
- ✅ NEXTAUTH_URL (Set)
- ✅ CRON_SECRET (Generated)

### Stripe Configuration
- ✅ Subscriptions created in Stripe Dashboard
- ✅ Webhook endpoint configured
- ✅ Live mode keys configured

---

## ⚠️ BEFORE GOING LIVE

### 1. Verify Stripe Products Have Correct Price IDs

In your Stripe Dashboard, verify these Price IDs match what's in the code:

**Required Price IDs:**
- `price_essentials_monthly` → $15/month
- `price_pro_monthly` → $39/month
- `price_business_monthly` → $99/month
- `price_addon_reddit` → $19/month
- `price_addon_linkedin` → $19/month
- `price_addon_analytics` → $25/month

If your Price IDs are different, you need to tell me so I can update the code.

### 2. Initialize Database Schema

Run this command to create the database tables:

```bash
cd /Users/nexteleven/pulse-social
npx prisma db push --skip-generate
```

This will create all the necessary tables in your Supabase database.

### 3. Disable Vercel Deployment Protection

Go to: https://vercel.com/sean-mcdonnells-projects-4fbf31ab/pulse-social/settings/deployment-protection

**Disable** or configure the authentication to make the site publicly accessible.

### 4. Test Stripe Webhook (Critical!)

Test that webhooks are working:

```bash
# In Stripe Dashboard > Webhooks
# Click on your webhook
# Click "Send test webhook"
# Select "checkout.session.completed"
# Click "Send test webhook"
```

Check the webhook logs to ensure it's receiving events.

### 5. Optional: Set Up Custom Domain

If you want to use one of your domains (deenbot.app, ecla.ai, etc.):

```bash
cd /Users/nexteleven/pulse-social
npx vercel domains add yourdomain.com
```

Then update NEXTAUTH_URL and Stripe webhook URL to match.

### 6. Optional: Configure Vercel Blob (for file uploads)

If you want media uploads to work:

1. Go to: https://vercel.com/dashboard/stores
2. Create a Blob store
3. Copy the token
4. Update environment variables:
   ```bash
   echo "YOUR_BLOB_TOKEN" | npx vercel env add BLOB_READ_WRITE_TOKEN production
   echo "YOUR_BLOB_TOKEN" | npx vercel env add NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN production
   ```

---

## 🎯 LAUNCH SEQUENCE

Once the above is done:

### Step 1: Final Deployment
```bash
cd /Users/nexteleven/pulse-social
npx vercel --prod
```

### Step 2: Test the Full Flow

1. **Sign Up**: Create a test account
2. **Onboarding**: Connect at least one platform
3. **Create Post**: Test posting (will use real Late API)
4. **Test Payment**: Use Stripe test card: `4242 4242 4242 4242`
5. **Verify Webhook**: Check Stripe dashboard for webhook events
6. **Test Limits**: Verify paywalls work

### Step 3: Go Live!

1. Disable Vercel deployment protection
2. Share your URL with customers
3. Start accepting payments!

---

## 📊 Current Status

**Deployment URL:** https://pulse-social-d0zh1husd-sean-mcdonnells-projects-4fbf31ab.vercel.app

**Status:** 
- Build: ✅ Success
- Database: ✅ Connected
- Stripe: ✅ Configured (Live mode)
- Late API: ✅ Working
- Webhooks: ✅ Secret configured

---

## ❓ Questions for You

1. **What are your actual Stripe Price IDs?** (So I can verify they match the code)
2. **Do you want to use a custom domain?** (If yes, which one?)
3. **Do you want to set up Vercel Blob now?** (For media uploads)

Once you answer these, I'll finalize everything and you'll be ready to launch! 🚀

