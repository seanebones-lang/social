import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error("No userId in metadata");
        }

        const plan = session.metadata?.plan || "essentials";
        const addons = session.metadata?.addons
          ? JSON.parse(session.metadata.addons)
          : [];

        await db.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
            plan,
            addons,
            postsUsed: 0,
            isLocked: false,
          },
        });

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (!user) break;

        await db.user.update({
          where: { id: user.id },
          data: {
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
            postsUsed: 0,
            isLocked: false,
          },
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (!user) break;

        console.log(`Payment failed for user ${user.id}`);
        // TODO: Send email notification

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) break;

        // Downgrade to free plan
        await db.user.update({
          where: { id: user.id },
          data: {
            plan: "free",
            addons: [],
            isLocked: user.postsUsed > 10, // Lock if exceeded free limit
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) break;

        await db.user.update({
          where: { id: user.id },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook handler error: ${error.message}`);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

