import { createTRPCRouter } from "@/lib/trpc/server";
import { authRouter } from "./routers/auth";
import { postsRouter } from "./routers/posts";
import { stripeRouter } from "./routers/stripe";
import { profilesRouter } from "./routers/profiles";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  posts: postsRouter,
  stripe: stripeRouter,
  profiles: profilesRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

