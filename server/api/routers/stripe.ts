import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import { stripe, STRIPE_PLANS, STRIPE_ADDONS } from "@/lib/stripe";
import { TRPCError } from "@trpc/server";
import type Stripe from "stripe";

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["essentials", "pro", "business"]),
        addons: z.array(z.enum(["reddit", "linkedin", "analytics"])).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        try {
          const customer = await stripe.customers.create({
            email: user.email!,
            name: user.name || undefined,
            metadata: {
              userId: user.id,
            },
          });
          customerId = customer.id;

          await ctx.db.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId },
          });
        } catch (error: any) {
          console.error("Stripe customer creation failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create Stripe customer. Please try again.",
          });
        }
      }

      // Build line items
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price: STRIPE_PLANS[input.plan].priceId,
          quantity: 1,
        },
      ];

      // Add addons
      if (input.addons) {
        for (const addon of input.addons) {
          lineItems.push({
            price: STRIPE_ADDONS[addon].priceId,
            quantity: 1,
          });
        }
      }

      // Create checkout session
      let session;
      try {
        session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: lineItems,
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            userId: user.id,
            plan: input.plan,
            addons: JSON.stringify(input.addons || []),
          },
        },
        metadata: {
          userId: user.id,
          plan: input.plan,
        },
      });
      } catch (error: any) {
        console.error("Stripe checkout session creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session. Please try again.",
        });
      }

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user?.stripeCustomerId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No Stripe customer found",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    });

    return {
      url: session.url,
    };
  }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        plan: true,
        addons: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        trialEndsAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return user;
  }),
});

