import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const STRIPE_PLANS = {
  essentials: {
    name: "Essentials",
    price: 15,
    priceId: "prod_TU04fwafqq0JGD",
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
    priceId: "prod_TU0BvgfiYUmqaK",
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
    priceId: "prod_TU0CxvbgbzpjUr",
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
    priceId: "price_addon_reddit",
  },
  linkedin: {
    name: "LinkedIn Pro Suite",
    price: 19,
    priceId: "price_addon_linkedin",
  },
  analytics: {
    name: "Analytics Pro",
    price: 25,
    priceId: "price_addon_analytics",
  },
};

