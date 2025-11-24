# 🚨 CRITICAL PRE-LAUNCH CHECKLIST

## Test These NOW Before Going Live

### ✅ Infrastructure Tests

1. **Site Loads**
   - Go to: https://social.mothership-ai.com
   - Should see landing page with "Pulse Social" branding
   - Status: ✅

2. **Sign Up Works**
   - Go to: https://social.mothership-ai.com/signup
   - Create test account with email/password
   - Should redirect to /onboarding
   - **TEST THIS NOW** ⚠️

3. **Sign In Works**
   - Go to: https://social.mothership-ai.com/signin
   - Sign in with test account
   - Should redirect to /dashboard
   - **TEST THIS NOW** ⚠️

4. **Database Connection**
   - Sign up should create user in database
   - Check Supabase dashboard for new user record
   - **VERIFY THIS** ⚠️

### ✅ Payment Tests (CRITICAL)

5. **Pricing Page Loads**
   - Go to: https://social.mothership-ai.com/pricing
   - Should show 3 plans with correct prices
   - Add-ons should toggle
   - **TEST THIS NOW** ⚠️

6. **Stripe Checkout Works**
   - Click "Start Free Trial" on any plan
   - Should redirect to Stripe checkout
   - Use test card: `4242 4242 4242 4242`
   - **TEST THIS NOW** ⚠️

7. **Webhook Receives Events**
   - After test checkout, check Stripe Dashboard > Webhooks
   - Should show successful events
   - **VERIFY THIS** ⚠️

8. **Subscription Activates**
   - After checkout, go to /dashboard/settings
   - Should show active subscription
   - **TEST THIS NOW** ⚠️

### ✅ Core Features

9. **Onboarding Flow**
   - Should create Late profile
   - Should show 10 platform connection cards
   - Each should have invite URL
   - **TEST THIS NOW** ⚠️

10. **Post Composer**
    - Go to /dashboard
    - Should show composer with platform grid
    - Select platforms
    - Enter content
    - **TEST THIS NOW** ⚠️

11. **Usage Limits**
    - Should show "Posts: 0 / X" in header
    - Free users should see 0 / 10
    - **VERIFY THIS** ⚠️

12. **Premium Locks**
    - Try to select Reddit without addon
    - Should show upgrade modal
    - Try to select LinkedIn without addon
    - Should show upgrade modal
    - **TEST THIS NOW** ⚠️

---

## 🔧 Known Issues to Check

### Issue 1: Database Connection
**Status:** Just fixed with pooler connection
**Test:** Try signing up now

### Issue 2: Stripe Price IDs
**Status:** Updated with your real IDs
**Test:** Checkout should work

### Issue 3: Late API Integration
**Status:** Master key configured
**Test:** Onboarding should create profile

---

## ⚠️ MUST DO BEFORE LAUNCH

### 1. Verify Stripe Webhook is Working

Go to: https://dashboard.stripe.com/test/webhooks

Find your webhook for `https://social.mothership-ai.com/api/stripe/webhook`

Click "Send test webhook" → Select "checkout.session.completed"

**Check the response - should be 200 OK**

### 2. Test Complete User Flow

1. Sign up with new email
2. Complete onboarding
3. Try to create a post (will hit usage limit)
4. Go to pricing
5. Purchase a plan (use test card)
6. Verify subscription activates
7. Create a real post
8. Verify it works

### 3. Check Environment Variables

Run this to verify all are set:

```bash
npx vercel env ls production
```

Should show:
- ✅ DATABASE_URL
- ✅ DIRECT_URL
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- ✅ LATE_MASTER_API_KEY
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ CRON_SECRET
- ⚠️ BLOB_READ_WRITE_TOKEN (optional)
- ⚠️ NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN (optional)

---

## 🚨 If Sign Up Still Fails

Try this diagnostic:

1. Go to: https://supabase.com/dashboard/project/yrhieyxgxyrkssljruqc
2. Check if project is paused (free tier auto-pauses after inactivity)
3. Click "Resume" if needed
4. Verify connection string in Settings > Database
5. Test connection with:

```bash
psql "postgresql://postgres.yrhieyxgxyrkssljruqc:gadked-byqxa1-papceR@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## 📞 What I Need From You

**Try signing up now at https://social.mothership-ai.com/signup**

Tell me:
1. Does it work?
2. If not, what's the exact error message?
3. Can you check if your Supabase project is active (not paused)?

I'll fix any remaining issues immediately!

