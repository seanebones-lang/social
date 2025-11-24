import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 30000, // 30 seconds
});

export const STRIPE_PLANS = {
  essentials: {
    name: "Essentials",
    price: 15,
    priceId: "price_1SX24aCHzMTnpYNoD0i7ui4w",
    features: ["2 profiles", "5 platforms", "100 posts/month"],
    limits: {
      profiles: 2,
      platforms: 5,
      posts: 100,
    },
  },
  pro: {
    name: "Pro",
    price: 39,
    priceId: "price_1SX2AoCHzMTnpYNoBCRFGtVE",
    features: ["10 profiles", "All platforms", "500 posts/month"],
    limits: {
      profiles: 10,
      platforms: 10,
      posts: 500,
    },
  },
  business: {
    name: "Business",
    price: 99,
    priceId: "price_1SX2BpCHzMTnpYNoQSDAM3sg",
    features: ["50 profiles", "All platforms", "Unlimited posts"],
    limits: {
      profiles: 50,
      platforms: 10,
      posts: 999999,
    },
  },
};

export const STRIPE_ADDONS = {
  reddit: {
    name: "Reddit Virality Pack",
    price: 19,
    priceId: "price_1SX2SzCHzMTnpYNoDBfMAlP2",
  },
  linkedin: {
    name: "LinkedIn Pro Suite",
    price: 19,
    priceId: "price_1SX2TnCHzMTnpYNo3QSWBG5w",
  },
  analytics: {
    name: "Analytics Pro",
    price: 25,
    priceId: "price_1SX2UUCHzMTnpYNoKgH11ZCc",
  },
};

